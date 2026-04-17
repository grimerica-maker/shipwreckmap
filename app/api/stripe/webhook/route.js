import { NextResponse } from "next/server";
import Stripe from "stripe";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.clerk_user_id;
    const mode = session.mode; // "subscription" or "payment"

    if (userId) {
      try {
        // Clerk v5.7.5+ — clerkClient is now async
        const client = await clerkClient();
        const tier = mode === "payment" ? "lifetime" : "pro";

        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            shipmap_tier: tier,
          },
        });

        console.log(`ShipwreckMap: Set ${userId} to ${tier}`);
      } catch (err) {
        console.error("Failed to update Clerk metadata:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
