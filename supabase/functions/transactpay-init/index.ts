import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRANSACTPAY_API_URL = "https://payment-api-service.transactpay.ai";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      amount,
      email,
      reference,
      currency,
      callback_url,
      metadata,
      public_key,
      secret_key,
    } = await req.json();

    if (!public_key || !secret_key) {
      throw new Error("Missing TransactPay credentials");
    }

    if (!amount || !email || !reference) {
      throw new Error("Missing required payment fields");
    }

    console.log("Initializing TransactPay payment:", {
      amount,
      email,
      reference,
      currency,
    });

    const response = await fetch(
      `${TRANSACTPAY_API_URL}/payment/order/create`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": public_key,
          "Accept": "application/json",
        },
        body: JSON.stringify({
          amount,
          email,
          reference,
          currency: currency || "NGN",
          callback_url: callback_url || "",
          metadata: metadata || {},
        }),
      }
    );

    const responseText = await response.text();
    console.log("TransactPay response status:", response.status);
    console.log("TransactPay response body:", responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse TransactPay response:", responseText);
      throw new Error(
        `Invalid response from payment gateway: ${responseText.substring(0, 100)}`
      );
    }

    if (!response.ok) {
      console.error("TransactPay error:", result);
      throw new Error(
        result.message || result.error || "Payment initialization failed"
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error: any) {
    console.error("TransactPay init error:", error);

    return new Response(
      JSON.stringify({
        status: false,
        message: error.message || "Failed to initialize payment",
        error: error.toString(),
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});