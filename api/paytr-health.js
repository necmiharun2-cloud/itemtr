/**
 * GET /api/paytr-health — ödeme sunucusunun yapılandırılıp yapılandırılmadığını döner.
 */
export default function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const configured = Boolean(
    process.env.PAYTR_MERCHANT_ID &&
      process.env.PAYTR_MERCHANT_KEY &&
      process.env.PAYTR_MERCHANT_SALT &&
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  res.status(200).json({
    paytr: configured,
    testMode: process.env.PAYTR_TEST_MODE === "1" || process.env.PAYTR_TEST_MODE === "true",
  });
}
