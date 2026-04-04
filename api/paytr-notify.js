import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * PayTR bildirim URL — PayTR panelinde "Bildirim URL" olarak:
 * https://<domain>/api/paytr-notify
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("NOT ALLOWED");
    return;
  }

  const merchantKey = process.env.PAYTR_MERCHANT_KEY || "";
  const merchantSalt = process.env.PAYTR_MERCHANT_SALT || "";
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseService = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!merchantKey || !merchantSalt || !supabaseUrl || !supabaseService) {
    res.status(500).send("CONFIG");
    return;
  }

  let params = req.body;
  if (typeof params === "string") {
    params = Object.fromEntries(new URLSearchParams(params));
  }
  if (!params || typeof params !== "object") {
    res.status(400).send("BAD BODY");
    return;
  }

  const merchantOid = params.merchant_oid;
  const status = params.status;
  const totalAmount = params.total_amount;
  const hash = params.hash;

  if (!merchantOid || !status || totalAmount === undefined || !hash) {
    res.status(400).send("MISSING");
    return;
  }

  const hashStr = merchantOid + merchantSalt + status + totalAmount;
  const expected = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");

  if (expected !== hash) {
    console.error("[paytr-notify] hash mismatch");
    res.status(400).send("HASH FAIL");
    return;
  }

  const admin = createClient(supabaseUrl, supabaseService);
  const { data: payment } = await admin.from("payments").select("*").eq("id", merchantOid).maybeSingle();

  if (!payment) {
    console.error("[paytr-notify] payment not found", merchantOid);
    res.status(404).send("NO ORDER");
    return;
  }

  if (payment.status === "completed") {
    res.status(200).send("OK");
    return;
  }

  const expectedKurus = Math.round(Number(payment.amount) * 100);
  if (Number(totalAmount) !== expectedKurus) {
    console.error("[paytr-notify] amount mismatch", totalAmount, expectedKurus);
    res.status(400).send("AMOUNT");
    return;
  }

  if (status === "success") {
    const { data: profile } = await admin.from("profiles").select("balance").eq("id", payment.user_id).maybeSingle();
    const newBalance = Number(profile?.balance || 0) + Number(payment.amount);

    await admin
      .from("payments")
      .update({ status: "completed", metadata: { ...(payment.metadata || {}), paytr_notify: params } })
      .eq("id", payment.id);

    await admin.from("profiles").update({ balance: newBalance }).eq("id", payment.user_id);

    try {
      await admin.from("wallet_transactions").insert({
        user_id: payment.user_id,
        type: "deposit",
        amount: payment.amount,
        balance_after: newBalance,
        description: `PayTR bakiye yükleme — ${payment.id}`,
        status: "completed",
      });
    } catch (e) {
      console.warn("[paytr-notify] wallet_transactions:", e);
    }
  } else {
    await admin
      .from("payments")
      .update({
        status: "failed",
        metadata: {
          ...(payment.metadata || {}),
          paytr_notify: params,
          failed_reason: params.failed_reason_code,
        },
      })
      .eq("id", payment.id);
  }

  res.status(200).send("OK");
}
