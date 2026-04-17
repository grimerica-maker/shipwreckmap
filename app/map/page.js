"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import PaywallModal from "../components/PaywallModal";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
const API_BASE = "/api/engine";
const SHIP_POLL_INTERVAL = 60000; // 60s

// Wreck cause → color
const CAUSE_COLORS = {
  torpedo: "#e74c3c",
  storm: "#3498db",
  collision: "#f39c12",
  fire: "#e67e22",
  grounding: "#8b4513",
  scuttled: "#7f8c8d",
  mine: "#c0392b",
  unknown: "#95a5a6",
};

const SHIP_TYPE_COLORS = {
  cargo: "#4a90d9",
  tanker: "#e74c3c",
  passenger: "#2ecc71",
  fishing: "#f39c12",
  tug: "#9b59b6",
  pleasure: "#1abc9c",
  military: "#34495e",
  other: "#95a5a6",
};

function getCauseColor(cause) {
  if (!cause) return CAUSE_COLORS.unknown;
  const c = cause.toLowerCase();
  for (const [key, color] of Object.entries(CAUSE_COLORS)) {
    if (c.includes(key)) return color;
  }
  return CAUSE_COLORS.unknown;
}

export default function MapPage() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [paywallFeature, setPaywallFeature] = useState(null);

  // Auth
  const { user, isSignedIn } = useUser();
  const proTier = user?.publicMetadata?.shipmap_tier;
  const isPro = proTier === "pro" || proTier === "lifetime";

  // Layer visibility
  const [showShipWrecks, setShowShipWrecks] = useState(true);
  const [showAviationWrecks, setShowAviationWrecks] = useState(true);
  const [showLiveShips, setShowLiveShips] = useState(true);
  const [showTradeRoutes, setShowTradeRoutes] = useState(false);
  const [showDangerZones, setShowDangerZones] = useState(false);

  // Ship type filters
  const [shipTypeFilters, setShipTypeFilters] = useState({
    cargo: true, tanker: true, passenger: true, fishing: true,
    tug: true, pleasure: true, military: true, other: true,
  });

  const shipPollRef = useRef(null);

  // Trail button callback (from popup HTML)
  useEffect(() => {
    window.__shipwreckTrail = (mmsi) => {
      if (isPro) {
        // Fetch and render trail
        fetch(`${API_BASE}/ships/trail/${mmsi}`)
          .then(r => r.json())
          .then(data => {
            if (data.trail && data.trail.length > 1) {
              const coords = data.trail.map(t => [t.lng, t.lat]);
              const trailGeoJSON = {
                type: "Feature",
                geometry: { type: "LineString", coordinates: coords },
              };
              if (map.current.getSource("ship-trail")) {
                map.current.getSource("ship-trail").setData(trailGeoJSON);
              } else {
                map.current.addSource("ship-trail", { type: "geojson", data: trailGeoJSON });
                map.current.addLayer({
                  id: "ship-trail-line",
                  type: "line",
                  source: "ship-trail",
                  paint: {
                    "line-color": "#4a90d9",
                    "line-width": 3,
                    "line-opacity": 0.8,
                    "line-dasharray": [2, 1],
                  },
                });
              }
            }
          })
          .catch(console.error);
      } else {
        setPaywallFeature("trail");
      }
    };
    return () => { delete window.__shipwreckTrail; };
  }, [isPro]);

  // ─── Initialize Map ───────────────────────────────────
  useEffect(() => {
    if (map.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-30, 30],
      zoom: 2.5,
      projection: "globe",
      preserveDrawingBuffer: true,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    return () => {
      if (shipPollRef.current) clearInterval(shipPollRef.current);
    };
  }, []);

  // ─── Load Data When Map Ready ─────────────────────────
  useEffect(() => {
    if (!mapLoaded) return;
    loadWrecks();
    loadRoutes();
    loadDangerZones();
    loadLiveShips();
    loadStats();

    // Poll live ships
    shipPollRef.current = setInterval(loadLiveShips, SHIP_POLL_INTERVAL);
  }, [mapLoaded]);

  // ─── Wrecks Layer ─────────────────────────────────────
  const loadWrecks = async () => {
    try {
      const res = await fetch(`${API_BASE}/wrecks/all`);
      const data = await res.json();

      // Assign color to each feature
      data.features.forEach((f) => {
        f.properties._color = getCauseColor(f.properties.cause);
        f.properties._isAviation = f.properties.type === "aviation" ? 1 : 0;
        f.properties._isShip = f.properties.type === "ship" ? 1 : 0;
      });

      map.current.addSource("wrecks", {
        type: "geojson",
        data,
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50,
      });

      // Cluster circles
      map.current.addLayer({
        id: "wreck-clusters",
        type: "circle",
        source: "wrecks",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step", ["get", "point_count"],
            "#51bbd6", 10,
            "#f1f075", 50,
            "#f28cb1", 200,
            "#e74c3c",
          ],
          "circle-radius": [
            "step", ["get", "point_count"],
            15, 10, 20, 50, 25, 200, 35,
          ],
          "circle-opacity": 0.85,
          "circle-stroke-width": 2,
          "circle-stroke-color": "rgba(255,255,255,0.3)",
        },
      });

      // Cluster count label
      map.current.addLayer({
        id: "wreck-cluster-count",
        type: "symbol",
        source: "wrecks",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#1a1a1a" },
      });

      // Individual ship wreck markers
      map.current.addLayer({
        id: "wreck-ship-points",
        type: "circle",
        source: "wrecks",
        filter: ["all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "type"], "ship"],
        ],
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            2, 3, 8, 5, 12, 8,
          ],
          "circle-color": ["get", "_color"],
          "circle-stroke-width": 1,
          "circle-stroke-color": "rgba(255,255,255,0.5)",
          "circle-opacity": 0.9,
        },
      });

      // Individual aviation markers (triangle-ish via symbol)
      map.current.addLayer({
        id: "wreck-aviation-points",
        type: "circle",
        source: "wrecks",
        filter: ["all",
          ["!", ["has", "point_count"]],
          ["==", ["get", "type"], "aviation"],
        ],
        paint: {
          "circle-radius": [
            "interpolate", ["linear"], ["zoom"],
            2, 3, 8, 5, 12, 8,
          ],
          "circle-color": "#ff6b35",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
          "circle-opacity": 0.9,
        },
      });

      // Click handlers
      map.current.on("click", "wreck-ship-points", handleWreckClick);
      map.current.on("click", "wreck-aviation-points", handleWreckClick);
      map.current.on("click", "wreck-clusters", (e) => {
        const features = map.current.queryRenderedFeatures(e.point, { layers: ["wreck-clusters"] });
        const clusterId = features[0].properties.cluster_id;
        map.current.getSource("wrecks").getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          map.current.easeTo({ center: features[0].geometry.coordinates, zoom: zoom });
        });
      });

      // Cursors
      map.current.on("mouseenter", "wreck-ship-points", () => { map.current.getCanvas().style.cursor = "pointer"; });
      map.current.on("mouseleave", "wreck-ship-points", () => { map.current.getCanvas().style.cursor = ""; });
      map.current.on("mouseenter", "wreck-aviation-points", () => { map.current.getCanvas().style.cursor = "pointer"; });
      map.current.on("mouseleave", "wreck-aviation-points", () => { map.current.getCanvas().style.cursor = ""; });
      map.current.on("mouseenter", "wreck-clusters", () => { map.current.getCanvas().style.cursor = "pointer"; });
      map.current.on("mouseleave", "wreck-clusters", () => { map.current.getCanvas().style.cursor = ""; });

    } catch (err) {
      console.error("Failed to load wrecks:", err);
    }
  };

  const handleWreckClick = (e) => {
    const f = e.features[0];
    const coords = f.geometry.coordinates.slice();
    const p = f.properties;

    const isAviation = p.type === "aviation";
    const icon = isAviation ? "✈️" : "⚓";
    const typeLabel = isAviation ? "Aviation Disaster" : "Shipwreck";

    let html = `
      <div style="font-family:'Source Serif 4',Georgia,serif;max-width:280px;color:#e0e0e0;">
        <div style="font-size:16px;font-weight:700;margin-bottom:6px;">${icon} ${p.name || "Unknown"}</div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:8px;">${typeLabel}</div>
    `;

    if (p.date) html += `<div style="margin:3px 0;"><span style="color:#888;">Date:</span> ${p.date}</div>`;
    if (p.cause) html += `<div style="margin:3px 0;"><span style="color:#888;">Cause:</span> ${p.cause}</div>`;
    if (p.casualties) html += `<div style="margin:3px 0;"><span style="color:#888;">Lives lost:</span> <strong style="color:#e74c3c;">${Number(p.casualties).toLocaleString()}</strong></div>`;
    if (p.depth_m) html += `<div style="margin:3px 0;"><span style="color:#888;">Depth:</span> ${Number(p.depth_m).toLocaleString()}m</div>`;
    if (p.tonnage) html += `<div style="margin:3px 0;"><span style="color:#888;">Tonnage:</span> ${Number(p.tonnage).toLocaleString()} GT</div>`;
    if (p.flag) html += `<div style="margin:3px 0;"><span style="color:#888;">Flag:</span> ${p.flag}</div>`;
    if (p.vessel_type) html += `<div style="margin:3px 0;"><span style="color:#888;">Type:</span> ${p.vessel_type}</div>`;
    if (p.operator) html += `<div style="margin:3px 0;"><span style="color:#888;">Operator:</span> ${p.operator}</div>`;
    if (p.aircraft_type) html += `<div style="margin:3px 0;"><span style="color:#888;">Aircraft:</span> ${p.aircraft_type}</div>`;

    if (p.wiki_url) {
      html += `<div style="margin-top:8px;"><a href="${p.wiki_url}" target="_blank" rel="noopener" style="color:#4a9eff;text-decoration:none;font-size:13px;">Wikipedia →</a></div>`;
    }

    html += `<div style="margin-top:6px;font-size:11px;color:#666;">${coords[1].toFixed(4)}°N, ${coords[0].toFixed(4)}°W</div>`;
    html += `</div>`;

    new mapboxgl.Popup({ maxWidth: "320px", className: "wreck-popup" })
      .setLngLat(coords)
      .setHTML(html)
      .addTo(map.current);
  };

  // ─── Trade Routes Layer ───────────────────────────────
  const loadRoutes = async () => {
    try {
      const res = await fetch(`${API_BASE}/routes/trade`);
      const data = await res.json();

      map.current.addSource("trade-routes", { type: "geojson", data });

      map.current.addLayer({
        id: "trade-routes-line",
        type: "line",
        source: "trade-routes",
        layout: { visibility: "none", "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 2.5,
          "line-opacity": 0.7,
          "line-dasharray": [4, 2],
        },
      });

      // Route labels
      map.current.addLayer({
        id: "trade-routes-labels",
        type: "symbol",
        source: "trade-routes",
        layout: {
          visibility: "none",
          "symbol-placement": "line-center",
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": 11,
          "text-offset": [0, -1],
        },
        paint: { "text-color": "#ccc", "text-halo-color": "#111", "text-halo-width": 1.5 },
      });

      // Click popup for routes
      map.current.on("click", "trade-routes-line", (e) => {
        const p = e.features[0].properties;
        const html = `
          <div style="font-family:'Source Serif 4',Georgia,serif;max-width:260px;color:#e0e0e0;">
            <div style="font-size:15px;font-weight:700;margin-bottom:4px;">🗺️ ${p.name}</div>
            <div style="font-size:12px;color:#aaa;margin-bottom:6px;">${p.era}</div>
            <div style="font-size:13px;line-height:1.4;">${p.description}</div>
          </div>
        `;
        new mapboxgl.Popup({ maxWidth: "300px", className: "wreck-popup" })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map.current);
      });

    } catch (err) {
      console.error("Failed to load routes:", err);
    }
  };

  // ─── Danger Zones Layer ───────────────────────────────
  const loadDangerZones = async () => {
    try {
      const res = await fetch(`${API_BASE}/routes/dangerous`);
      const data = await res.json();

      // Split into polygons and points
      const polygons = { type: "FeatureCollection", features: data.features.filter(f => f.geometry.type === "Polygon") };
      const points = { type: "FeatureCollection", features: data.features.filter(f => f.geometry.type === "Point") };

      map.current.addSource("danger-polygons", { type: "geojson", data: polygons });
      map.current.addSource("danger-points", { type: "geojson", data: points });

      map.current.addLayer({
        id: "danger-polygon-fill",
        type: "fill",
        source: "danger-polygons",
        layout: { visibility: "none" },
        paint: { "fill-color": ["get", "color"], "fill-opacity": 0.15 },
      });

      map.current.addLayer({
        id: "danger-polygon-outline",
        type: "line",
        source: "danger-polygons",
        layout: { visibility: "none" },
        paint: { "line-color": ["get", "color"], "line-width": 2, "line-opacity": 0.6, "line-dasharray": [3, 2] },
      });

      map.current.addLayer({
        id: "danger-points-circle",
        type: "circle",
        source: "danger-points",
        layout: { visibility: "none" },
        paint: {
          "circle-radius": 20,
          "circle-color": ["get", "color"],
          "circle-opacity": 0.2,
          "circle-stroke-width": 2,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": 0.6,
        },
      });

      map.current.addLayer({
        id: "danger-labels",
        type: "symbol",
        source: "danger-points",
        layout: {
          visibility: "none",
          "text-field": ["get", "name"],
          "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
          "text-size": 11,
          "text-offset": [0, 2],
        },
        paint: { "text-color": "#ff6666", "text-halo-color": "#111", "text-halo-width": 1 },
      });

      // Click popups
      const dangerClick = (e) => {
        const p = e.features[0].properties;
        let html = `
          <div style="font-family:'Source Serif 4',Georgia,serif;max-width:280px;color:#e0e0e0;">
            <div style="font-size:15px;font-weight:700;margin-bottom:4px;">⚠️ ${p.name}</div>
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#ff6666;margin-bottom:6px;">Danger: ${p.danger_level}</div>
            <div style="font-size:13px;line-height:1.4;">${p.description}</div>
        `;
        if (p.notable_losses) html += `<div style="margin-top:6px;font-size:12px;color:#aaa;"><strong>Notable losses:</strong> ${p.notable_losses}</div>`;
        html += `</div>`;
        new mapboxgl.Popup({ maxWidth: "320px", className: "wreck-popup" })
          .setLngLat(e.lngLat)
          .setHTML(html)
          .addTo(map.current);
      };

      map.current.on("click", "danger-polygon-fill", dangerClick);
      map.current.on("click", "danger-points-circle", dangerClick);

    } catch (err) {
      console.error("Failed to load danger zones:", err);
    }
  };

  // ─── Live Ships Layer ─────────────────────────────────
  const loadLiveShips = async () => {
    try {
      const res = await fetch(`${API_BASE}/ships/current`);
      const data = await res.json();

      if (map.current.getSource("live-ships")) {
        map.current.getSource("live-ships").setData(data);
      } else {
        map.current.addSource("live-ships", { type: "geojson", data });

        map.current.addLayer({
          id: "live-ships-layer",
          type: "circle",
          source: "live-ships",
          paint: {
            "circle-radius": [
              "interpolate", ["linear"], ["zoom"],
              2, 2, 6, 3, 10, 5,
            ],
            "circle-color": [
              "match", ["get", "type_category"],
              "cargo", SHIP_TYPE_COLORS.cargo,
              "tanker", SHIP_TYPE_COLORS.tanker,
              "passenger", SHIP_TYPE_COLORS.passenger,
              "fishing", SHIP_TYPE_COLORS.fishing,
              "tug", SHIP_TYPE_COLORS.tug,
              "pleasure", SHIP_TYPE_COLORS.pleasure,
              "military", SHIP_TYPE_COLORS.military,
              SHIP_TYPE_COLORS.other,
            ],
            "circle-opacity": 0.85,
            "circle-stroke-width": 1,
            "circle-stroke-color": "rgba(255,255,255,0.4)",
          },
        });

        // Ship click popup
        map.current.on("click", "live-ships-layer", (e) => {
          const p = e.features[0].properties;
          const coords = e.features[0].geometry.coordinates;
          let html = `
            <div style="font-family:'Source Serif 4',Georgia,serif;max-width:260px;color:#e0e0e0;">
              <div style="font-size:15px;font-weight:700;margin-bottom:4px;">🚢 ${p.name || "Unknown Vessel"}</div>
              <div style="font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#4a90d9;margin-bottom:8px;">${p.type_category || "vessel"} — live</div>
          `;
          if (p.flag) html += `<div style="margin:3px 0;"><span style="color:#888;">Flag:</span> ${p.flag}</div>`;
          if (p.speed !== undefined && p.speed !== null) html += `<div style="margin:3px 0;"><span style="color:#888;">Speed:</span> ${p.speed} kts</div>`;
          if (p.heading !== undefined && p.heading !== null && p.heading !== 511) html += `<div style="margin:3px 0;"><span style="color:#888;">Heading:</span> ${p.heading}°</div>`;
          if (p.destination) html += `<div style="margin:3px 0;"><span style="color:#888;">Destination:</span> ${p.destination}</div>`;
          html += `<div style="margin:3px 0;"><span style="color:#888;">MMSI:</span> ${p.mmsi}</div>`;
          html += `<div style="margin-top:8px;"><button onclick="window.__shipwreckTrail('${p.mmsi}')" style="background:rgba(74,144,217,0.15);border:1px solid rgba(74,144,217,0.3);color:#4a90d9;padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-family:'Source Serif 4',Georgia,serif;width:100%;">🚢 View Trail <span style="font-size:10px;opacity:0.7;">PRO</span></button></div>`;
          html += `</div>`;

          new mapboxgl.Popup({ maxWidth: "300px", className: "wreck-popup" })
            .setLngLat(coords)
            .setHTML(html)
            .addTo(map.current);
        });

        map.current.on("mouseenter", "live-ships-layer", () => { map.current.getCanvas().style.cursor = "pointer"; });
        map.current.on("mouseleave", "live-ships-layer", () => { map.current.getCanvas().style.cursor = ""; });
      }
    } catch (err) {
      console.error("Failed to load live ships:", err);
    }
  };

  // ─── Stats ────────────────────────────────────────────
  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/wrecks/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  };

  // ─── Layer Toggles ────────────────────────────────────
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    const setVis = (layers, visible) => {
      layers.forEach((id) => {
        if (map.current.getLayer(id)) {
          map.current.setLayoutProperty(id, "visibility", visible ? "visible" : "none");
        }
      });
    };

    setVis(["wreck-ship-points"], showShipWrecks);
    setVis(["wreck-aviation-points"], showAviationWrecks);
    setVis(["wreck-clusters", "wreck-cluster-count"], showShipWrecks || showAviationWrecks);
    setVis(["live-ships-layer"], showLiveShips);
    setVis(["trade-routes-line", "trade-routes-labels"], showTradeRoutes);
    setVis(["danger-polygon-fill", "danger-polygon-outline", "danger-points-circle", "danger-labels"], showDangerZones);
  }, [mapLoaded, showShipWrecks, showAviationWrecks, showLiveShips, showTradeRoutes, showDangerZones]);

  // ─── Search ───────────────────────────────────────────
  const handleSearch = async (q) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await fetch(`${API_BASE}/wrecks/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data.features || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  const flyToWreck = (feature) => {
    const coords = feature.geometry.coordinates;
    map.current.flyTo({ center: coords, zoom: 10, duration: 2000 });
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);

    // Trigger popup
    setTimeout(() => {
      const p = feature.properties;
      const icon = p.type === "aviation" ? "✈️" : "⚓";
      let html = `<div style="font-family:'Source Serif 4',Georgia,serif;max-width:280px;color:#e0e0e0;">
        <div style="font-size:16px;font-weight:700;margin-bottom:6px;">${icon} ${p.name}</div>`;
      if (p.date) html += `<div><span style="color:#888;">Date:</span> ${p.date}</div>`;
      if (p.casualties) html += `<div><span style="color:#888;">Lives lost:</span> <strong style="color:#e74c3c;">${Number(p.casualties).toLocaleString()}</strong></div>`;
      if (p.wiki_url) html += `<div style="margin-top:8px;"><a href="${p.wiki_url}" target="_blank" style="color:#4a9eff;">Wikipedia →</a></div>`;
      html += `</div>`;
      new mapboxgl.Popup({ maxWidth: "320px", className: "wreck-popup" })
        .setLngLat(coords).setHTML(html).addTo(map.current);
    }, 2200);
  };

  // ─── Render ───────────────────────────────────────────
  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#0a0e17" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />

      {/* Title Bar */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        background: "linear-gradient(180deg, rgba(10,14,23,0.95) 0%, rgba(10,14,23,0.7) 80%, transparent 100%)",
        padding: "12px 16px 24px", pointerEvents: "none", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, pointerEvents: "auto" }}>
          <a href="/">
            <img src="/logo.png" alt="ShipwreckMap" style={{ height: 40, width: "auto", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))" }} />
          </a>
          <span style={{ fontSize: 11, color: "#666", letterSpacing: "2px", textTransform: "uppercase" }}>
            {stats ? `${stats.total.toLocaleString()} wrecks` : "loading..."}
          </span>
        </div>
      </div>

      {/* Search */}
      <div style={{
        position: "absolute", top: 56, left: 16, zIndex: 20,
        width: showSearch ? 300 : 40,
        transition: "width 0.3s ease",
      }}>
        {!showSearch ? (
          <button onClick={() => setShowSearch(true)} style={{
            width: 40, height: 40, borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(10,14,23,0.9)", color: "#ccc", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>🔍</button>
        ) : (
          <div style={{
            background: "rgba(10,14,23,0.95)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.15)",
            overflow: "hidden",
          }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search wrecks..."
                autoFocus
                style={{
                  flex: 1, padding: "10px 12px", background: "transparent", border: "none",
                  color: "#e0e0e0", fontSize: 14, outline: "none",
                  fontFamily: "'Source Serif 4', Georgia, serif",
                }}
              />
              <button onClick={() => { setShowSearch(false); setSearchQuery(""); setSearchResults([]); }} style={{
                padding: "10px 12px", background: "transparent", border: "none",
                color: "#666", fontSize: 14, cursor: "pointer",
              }}>✕</button>
            </div>
            {searchResults.length > 0 && (
              <div style={{ maxHeight: 250, overflowY: "auto", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {searchResults.map((f, i) => (
                  <div key={i} onClick={() => flyToWreck(f)} style={{
                    padding: "8px 12px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: 13, color: "#ccc", fontFamily: "'Source Serif 4', Georgia, serif",
                  }}
                    onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <span>{f.properties.type === "aviation" ? "✈️" : "⚓"}</span>{" "}
                    <strong>{f.properties.name}</strong>
                    {f.properties.date && <span style={{ color: "#666", marginLeft: 8 }}>{f.properties.date}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Layer Controls */}
      <div style={{
        position: "absolute", bottom: 24, left: 16, zIndex: 20,
        background: "rgba(10,14,23,0.92)", borderRadius: 10, padding: "12px 14px",
        border: "1px solid rgba(255,255,255,0.1)",
        fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 13, color: "#ccc",
        minWidth: 200,
      }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "1.5px", color: "#666", marginBottom: 8 }}>Layers</div>

        <LayerToggle label="⚓ Shipwrecks" checked={showShipWrecks} onChange={setShowShipWrecks} />
        <LayerToggle label="✈️ Aviation" checked={showAviationWrecks} onChange={setShowAviationWrecks} />
        <LayerToggle label="🚢 Live Ships" checked={showLiveShips} onChange={setShowLiveShips} />
        <LayerToggle label="🗺️ Trade Routes" checked={showTradeRoutes} onChange={setShowTradeRoutes} />
        <LayerToggle label="⚠️ Danger Zones" checked={showDangerZones} onChange={setShowDangerZones} />

        {/* Cause legend */}
        <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "1px", color: "#555", marginBottom: 6 }}>Wreck Cause</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(CAUSE_COLORS).map(([cause, color]) => (
              <div key={cause} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 10, color: "#888", textTransform: "capitalize" }}>{cause}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats badge */}
      {stats && (
        <div style={{
          position: "absolute", bottom: 24, right: 16, zIndex: 20,
          background: "rgba(10,14,23,0.92)", borderRadius: 10, padding: "10px 14px",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'Source Serif 4', Georgia, serif", fontSize: 12, color: "#888",
          textAlign: "right",
        }}>
          <div style={{ color: "#e0e0e0", fontSize: 18, fontWeight: 700 }}>
            {stats.total_casualties.toLocaleString()}
          </div>
          <div>lives lost at sea & air</div>
          <div style={{ marginTop: 4 }}>
            {stats.by_type.ship || 0} ships · {stats.by_type.aviation || 0} aircraft
          </div>
        </div>
      )}

      {/* Pro Actions (top right) */}
      <div style={{
        position: "absolute", top: 56, right: 16, zIndex: 20,
        display: "flex", flexDirection: "column", gap: 6,
      }}>
        <ProButton label="📊 Export CSV" onClick={() => {
          if (isPro) {
            window.open(`${API_BASE}/wrecks/export`, "_blank");
          } else {
            setPaywallFeature("export");
          }
        }} />
        <ProButton label="🌊 Depth Contours" onClick={() => {
          if (!isPro) setPaywallFeature("depth");
        }} locked={!isPro} />
      </div>

      {/* Paywall Modal */}
      {paywallFeature && (
        <PaywallModal feature={paywallFeature} onClose={() => setPaywallFeature(null)} />
      )}

      <style jsx global>{`
        .mapboxgl-popup-content {
          background: rgba(15, 20, 30, 0.95) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          border-radius: 8px !important;
          padding: 12px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: rgba(15, 20, 30, 0.95) !important;
        }
        .mapboxgl-popup-close-button {
          color: #666 !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
      `}</style>
    </div>
  );
}

function LayerToggle({ label, checked, onChange }) {
  return (
    <label style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "4px 0", cursor: "pointer", userSelect: "none",
    }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "#4a9eff" }}
      />
      <span style={{ opacity: checked ? 1 : 0.5 }}>{label}</span>
    </label>
  );
}

function ProButton({ label, onClick, locked = false }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px",
      background: "rgba(10,14,23,0.92)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8,
      color: locked ? "#666" : "#ccc",
      fontSize: 12,
      cursor: "pointer",
      fontFamily: "'Source Serif 4', Georgia, serif",
      display: "flex", alignItems: "center", gap: 6,
      transition: "border-color 0.2s",
      whiteSpace: "nowrap",
    }}
      onMouseOver={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"}
      onMouseOut={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
    >
      {label}
      {locked && <span style={{ fontSize: 10, color: "#4a90d9" }}>PRO</span>}
    </button>
  );
}
