import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();

  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const plan = session.metadata?.plan;

    if (!userId || !plan) {
      return NextResponse.json({ received: true });
    }

    let totalCredits = 5;

    switch (plan) {
      case "STARTER":
        totalCredits = 50;
        break;

      case "EMPIRE":
        totalCredits = 150;
        break;

      case "PRO":
        totalCredits = 500;
        break;

      case "ENTERPRISE":
        totalCredits = 999999;
        break;
    }

    await prisma.subscription.update({
      where: {
        userId,
      },
      data: {
        plan: plan as any,
        status: "ACTIVE",
        stripeCustomerId: session.customer?.toString(),
        stripeSubscriptionId: session.subscription?.toString(),
      },
    });

    await prisma.credits.update({
      where: {
        userId,
      },
      data: {
        total: totalCredits,
        remaining: totalCredits,
        used: 0,
      },
    });
  }

  return NextResponse.json({ received: true });
}