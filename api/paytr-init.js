import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

function siteOrigin() {
  const u = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (u) return u.replace(/\/$/, "");
  const v = process.env.VERCEL_URL;
  if (v) return `https://${v.replace(/\/$/, "")}`;
  return "http://localhost:5173";
}

function clientIp(req) {
  const xff = req.headers["x-forwarded-for"];
  if (typeof xff === "string" && xff.length > 0) return xff.split(",")[0].trim();
  const xr = req.headers["x-real-ip"];
  if (typeof xr === "string") return xr;
  return "127.0.0.1";
}

/**
 * PayTR iFrame API — 2. adım token (dev.paytr.com iframe-api)
 */
function buildPaytrToken(fields, merchantKey, merchantSalt) {
  const hashSTR = `${fields.merchant_id}${fields.user_ip}${fields.merchant_oid}${fields.email}${fields.payment_amount}${fields.user_basket}${fields.no_installment}${fields.max_installment}${fields.currency}${fields.test_mode}`;
  const payload = hashSTR + merchantSalt;
  return crypto.createHmac("sha256", merchantKey).update(payload).digest("base64");
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed" });
    return;
  }

  const merchantId = process.env.PAYTR_MERCHANT_ID || "";
  const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!merchantId || !merchantKey || !merchantSalt || !supabaseUrl || !supabaseAnon || !supabaseService) {
    res.status(503).json({
      ok: false,
      error: "Ödeme sunucusu yapılandırılmamış (PayTR veya Supabase ortam değişkenleri eksik).",
      configured: false,
    });
    return;
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    res.status(401).json({ ok: false, error: "Oturum gerekli." });
    return;
  }

  const supabaseUser = createClient(supabaseUrl, supabaseAnon);
  const {
    data: { user },
    error: userErr,
  } = await supabaseUser.auth.getUser(token);

  if (userErr || !user) {
    res.status(401).json({ ok: false, error: "Geçersiz veya süresi dolmuş oturum." });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch {
      body = {};
    }
  }

  const amount = Number(body.amount);
  const method = String(body.method || "card");
  if (!Number.isFinite(amount) || amount < 10 || amount > 500_000) {
    res.status(400).json({ ok: false, error: "Geçersiz tutar (10–500.000 ₺ arası)." });
    return;
  }

  const admin = createClient(supabaseUrl, supabaseService);
  const { data: payment, error: payErr } = await admin
    .from("payments")
    .insert({
      user_id: user.id,
      amount,
      currency: "TRY",
      status: "pending",
      payment_type: "deposit",
      description: `Bakiye yükleme — ${method === "papara" ? "Papara / dijital" : "Kredi kartı"}`,
      metadata: { method, initiated_at: new Date().toISOString() },
    })
    .select("id")
    .single();

  if (payErr || !payment?.id) {
    console.error("[paytr-init] payments insert:", payErr);
    res.status(500).json({ ok: false, error: "Ödeme kaydı oluşturulamadı." });
    return;
  }

  const merchantOid = String(payment.id);
  const paymentAmountKurus = Math.round(amount * 100);
  const basket = JSON.stringify([["Bakiye yükleme", amount.toFixed(2), 1]]);
  const userBasket = Buffer.from(basket, "utf8").toString("base64");
  const email = user.email || "musteri@itemtr.com";
  const testMode =
    process.env.PAYTR_TEST_MODE === "1" || process.env.PAYTR_TEST_MODE === "true" ? "1" : "0";
  const origin = siteOrigin();
  const userIp = clientIp(req);

  const fields = {
    merchant_id: merchantId,
    user_ip: userIp,
    merchant_oid: merchantOid,
    email,
    payment_amount: String(paymentAmountKurus),
    user_basket: userBasket,
    no_installment: "0",
    max_installment: "0",
    currency: "TL",
    test_mode: testMode,
  };

  const paytrToken = buildPaytrToken(fields, merchantKey, merchantSalt);

  const form = new URLSearchParams();
  form.set("merchant_id", merchantId);
  form.set("user_ip", userIp);
  form.set("merchant_oid", merchantOid);
  form.set("email", email);
  form.set("payment_amount", String(paymentAmountKurus));
  form.set("user_basket", userBasket);
  form.set("debug_on", process.env.PAYTR_DEBUG === "1" ? "1" : "0");
  form.set("no_installment", "0");
  form.set("max_installment", "0");
  form.set("user_name", user.user_metadata?.name || user.user_metadata?.username || "ItemTR Üye");
  form.set("user_address", "Türkiye");
  form.set("user_phone", user.phone || user.user_metadata?.phone || "05000000000");
  form.set("merchant_ok_url", `${origin}/payment/success`);
  form.set("merchant_fail_url", `${origin}/payment/fail`);
  form.set("timeout_limit", "30");
  form.set("currency", "TL");
  form.set("test_mode", testMode);
  form.set("lang", "tr");
  form.set("paytr_token", paytrToken);

  const paytrRes = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  const text = await paytrRes.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    res.status(502).json({ ok: false, error: "PayTR yanıtı okunamadı.", raw: text.slice(0, 200) });
    return;
  }

  if (json.status !== "success" || !json.token) {
    console.error("[paytr-init] PayTR:", json);
    await admin.from("payments").update({ status: "failed", metadata: { paytr_error: json } }).eq("id", payment.id);
    res.status(502).json({
      ok: false,
      error: json.reason || json.failed_reason_msg || "PayTR token alınamadı.",
      paytr: json,
    });
    return;
  }

  await admin
    .from("payments")
    .update({ paytr_order_id: json.token, metadata: { paytr_get_token: json, merchant_oid: merchantOid } })
    .eq("id", payment.id);

  res.status(200).json({
    ok: true,
    iframeToken: json.token,
    payUrl: `https://www.paytr.com/odeme/guvenli/${json.token}`,
    paymentId: payment.id,
  });
}
