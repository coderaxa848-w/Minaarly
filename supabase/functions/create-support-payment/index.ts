import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const { priceId, customAmount } = await req.json();

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Try to get user (optional for donations)
    let customerId: string | undefined;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      const user = data.user;
      if (user?.email) {
        const customers = await stripe.customers.list({ email: user.email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      }
    }

    // Build line item: either a fixed price ID or a custom amount
    let lineItem: Stripe.Checkout.SessionCreateParams.LineItem;

    if (customAmount && typeof customAmount === "number" && customAmount >= 100) {
      // Custom amount in pence
      lineItem = {
        price_data: {
          currency: "gbp",
          product_data: {
            name: "Support Minaarly",
            description: "Custom donation to support the Minaarly platform",
          },
          unit_amount: customAmount,
        },
        quantity: 1,
      };
    } else if (priceId) {
      lineItem = { price: priceId, quantity: 1 };
    } else {
      throw new Error("Either priceId or customAmount (in pence, min 100) must be provided");
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [lineItem],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/support?success=true`,
      cancel_url: `${req.headers.get("origin")}/support`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
