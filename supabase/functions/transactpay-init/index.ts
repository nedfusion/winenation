import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRANSACTPAY_API_URL = "https://payment-api-service.transactpay.ai";

async function encryptPayload(data: any, encryptionKey: string): Promise<string> {
  try {
    const pemKey = atob(encryptionKey);

    const modulusMatch = pemKey.match(/<Modulus>(.*?)<\/Modulus>/);
    const exponentMatch = pemKey.match(/<Exponent>(.*?)<\/Exponent>/);

    if (!modulusMatch || !exponentMatch) {
      throw new Error("Invalid RSA key format");
    }

    const modulusBase64 = modulusMatch[1];
    const exponentBase64 = exponentMatch[1];

    const modulus = Uint8Array.from(atob(modulusBase64), c => c.charCodeAt(0));
    const exponent = Uint8Array.from(atob(exponentBase64), c => c.charCodeAt(0));

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      {
        kty: "RSA",
        n: btoa(String.fromCharCode(...modulus)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
        e: btoa(String.fromCharCode(...exponent)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, ''),
        alg: "RSA-OAEP-256",
        ext: true,
      },
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);

    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      dataBuffer
    );

    const encryptedArray = new Uint8Array(encryptedBuffer);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray));

    return encryptedBase64;
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error(`Failed to encrypt payload: ${error.message}`);
  }
}

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
      encryption_key,
    } = await req.json();

    if (!public_key || !secret_key) {
      throw new Error("Missing TransactPay credentials");
    }

    if (!encryption_key) {
      throw new Error("Missing TransactPay encryption key");
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

    const payloadData = {
      amount,
      email,
      reference,
      currency: currency || "NGN",
      callback_url: callback_url || "",
      metadata: metadata || {},
    };

    console.log("Encrypting payload...");
    const encryptedData = await encryptPayload(payloadData, encryption_key);
    console.log("Payload encrypted successfully");

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
          data: encryptedData,
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