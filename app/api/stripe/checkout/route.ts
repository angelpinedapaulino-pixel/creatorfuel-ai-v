import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentUser } from "@/lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { plan } = await req.json();
    const user = await getCurrentUser();

if (!user) {
  return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
}

    let priceId = "";

    if (plan === "STARTER") {
      priceId = process.env.STRIPE_STARTER_PRICE_ID!;
    } else {
      priceId = process.env.STRIPE_EMPIRE_PRICE_ID!;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      client_reference_id: user.id,

metadata: {
  userId: user.id,
  plan,
},
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    });

    return NextResponse.json({
      url: session.url,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "Stripe error",
      },
      {
        status: 500,
      }
    );
  }
}