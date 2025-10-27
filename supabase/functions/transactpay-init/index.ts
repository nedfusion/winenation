import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TRANSACTPAY_API_URL = "https://payment-api-service.transactpay.ai";

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < buffer.length; i++) {
    binary += String.fromCharCode(buffer[i]);
  }
  return btoa(binary);
}

function bigIntToBytes(bigInt: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  let value = bigInt;
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(value & 0xFFn);
    value = value >> 8n;
  }
  return bytes;
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = 0n;
  for (let i = 0; i < bytes.length; i++) {
    result = (result << 8n) | BigInt(bytes[i]);
  }
  return result;
}

function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  base = base % modulus;
  while (exponent > 0n) {
    if (exponent % 2n === 1n) {
      result = (result * base) % modulus;
    }
    exponent = exponent >> 1n;
    base = (base * base) % modulus;
  }
  return result;
}

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

    const modulusBytes = base64ToArrayBuffer(modulusBase64);
    const exponentBytes = base64ToArrayBuffer(exponentBase64);

    const modulus = bytesToBigInt(modulusBytes);
    const exponent = bytesToBigInt(exponentBytes);
    const keyLength = modulusBytes.length;

    const jsonString = JSON.stringify(data);
    const messageBytes = new TextEncoder().encode(jsonString);

    if (messageBytes.length > keyLength - 11) {
      throw new Error("Message too long for RSA encryption");
    }

    const psLength = keyLength - messageBytes.length - 3;
    const ps = new Uint8Array(psLength);
    for (let i = 0; i < psLength; i++) {
      let byte;
      do {
        byte = Math.floor(Math.random() * 255) + 1;
      } while (byte === 0);
      ps[i] = byte;
    }

    const em = new Uint8Array(keyLength);
    em[0] = 0x00;
    em[1] = 0x02;
    em.set(ps, 2);
    em[2 + psLength] = 0x00;
    em.set(messageBytes, 3 + psLength);

    const m = bytesToBigInt(em);
    const c = modPow(m, exponent, modulus);
    const encryptedBytes = bigIntToBytes(c, keyLength);

    return arrayBufferToBase64(encryptedBytes);
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
      customer_name,
      phone,
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

    const nameParts = (customer_name || "Customer").split(" ");
    const firstname = nameParts[0] || "Customer";
    const lastname = nameParts.slice(1).join(" ") || "User";

    const payloadData = {
      customer: {
        firstname: firstname,
        lastname: lastname,
        mobile: phone || "+234",
        country: "NG",
        email: email,
      },
      order: {
        amount: amount,
        reference: reference,
        description: metadata?.description || "Payment for order",
        currency: currency || "NGN",
      },
      payment: {
        RedirectUrl: callback_url || "",
      },
    };

    console.log("Encrypting payload with PKCS#1 v1.5...");
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
      throw new Error("Invalid response from payment gateway");
    }

    if (!response.ok) {
      console.error("TransactPay error:", result);
      throw new Error(
        result.message || result.error || "Payment initialization failed"
      );
    }

    console.log("========== TRANSACTPAY API RESPONSE DEBUG ==========");
    console.log("Response status:", response.status);
    console.log("Full result keys:", Object.keys(result));
    console.log("Full result:", JSON.stringify(result, null, 2));

    if (result.data) {
      console.log("result.data keys:", Object.keys(result.data));
      console.log("result.data:", JSON.stringify(result.data, null, 2));
    }
    console.log("====================================================");

    let paymentUrl = null;

    if (result.data) {
      const data = result.data;

      paymentUrl = data.paymentLink
                || data.payment_link
                || data.PaymentLink
                || data.link
                || data.url
                || data.paymentUrl
                || data.payment_url;

      if (!paymentUrl && data.payment) {
        paymentUrl = data.payment.link
                  || data.payment.url
                  || data.payment.paymentLink
                  || data.payment.checkoutUrl;
      }

      if (!paymentUrl && data.token) {
        paymentUrl = `https://payment-link.transactpay.ai/${data.token}`;
        console.log("Generated payment link from token:", paymentUrl);
      }

      if (!paymentUrl && data.id) {
        paymentUrl = `https://payment-link.transactpay.ai/${data.id}`;
        console.log("Generated payment link from id:", paymentUrl);
      }

      if (!paymentUrl) {
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.includes('transactpay.ai')) {
            console.log(`Found TransactPay URL in field "${key}":`, value);
            paymentUrl = value;
            break;
          }
        }
      }

      if (!paymentUrl) {
        for (const [key, value] of Object.entries(data)) {
          if (typeof value === 'string' && value.startsWith('http')) {
            console.log(`Found HTTP URL in field "${key}":`, value);
            paymentUrl = value;
            break;
          }
        }
      }
    }

    if (paymentUrl) {
      result.data = result.data || {};
      result.data.payment_url = paymentUrl;
      console.log("Payment URL found:", paymentUrl);
    } else {
      console.error("No payment URL found in response");
      console.error("Available top-level fields:", Object.keys(result));
      if (result.data) {
        console.error("Available data fields:", Object.keys(result.data));
        console.error("Data values:", JSON.stringify(result.data, null, 2));
      }
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
