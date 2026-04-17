[README.md](https://github.com/user-attachments/files/26834154/README.md)
# ShipwreckMap.ca

Every wreck on Earth — sea & air. Plus live vessel tracking.

## Stack

- **Frontend:** Next.js 14 / Vercel
- **Backend:** FastAPI / DigitalOcean (port 8004)
- **Map:** Mapbox GL JS
- **Auth:** Clerk (Dev mode)
- **Payments:** Stripe ($12.99/yr, $29.99 lifetime)

## Setup

1. `npm install`
2. Copy `.env.local.example` → `.env.local`, fill in keys
3. `npm run dev`

## Data Sources

- Wikidata SPARQL (~4K notable wrecks + aviation)
- NOAA AWOIS (~10K US coastal wrecks)
- OpenStreetMap Overpass (~15K global wrecks)
- AISStream.io (live AIS vessel positions)

## Backend

See `/backend/` — deploy to DigitalOcean server, port 8004.
