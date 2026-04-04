import { supabase } from "./supabase";

export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export type PaymentTransaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  paytr_order_id?: string;
  status: PaymentStatus;
  payment_type: "deposit" | "purchase";
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at?: string;
};

function paytrApiUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  return `${base}/api/paytr-init`;
}

/**
 * PayTR ödemesini sunucu üzerinden başlatır (kayıt + token). Başarıda yönlendirme URL’si döner.
 */
export const startPaytrDeposit = async (
  amount: number,
  method: "card" | "papara",
): Promise<{ ok: true; payUrl: string; paymentId: string } | { ok: false; error: string; configured?: boolean }> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    return { ok: false, error: "Oturum bulunamadı. Tekrar giriş yapın." };
  }

  try {
    const res = await fetch(paytrApiUrl(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount, method }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      error?: string;
      configured?: boolean;
      payUrl?: string;
      paymentId?: string;
    };

    if (!res.ok || !data.ok || !data.payUrl || !data.paymentId) {
      return {
        ok: false,
        error: data.error || "Ödeme başlatılamadı.",
        configured: data.configured,
      };
    }

    return { ok: true, payUrl: data.payUrl, paymentId: data.paymentId };
  } catch (e) {
    console.error("[Payment] startPaytrDeposit:", e);
    return { ok: false, error: "Sunucuya bağlanılamadı. Ağ veya yapılandırmayı kontrol edin." };
  }
};

export const getUserPayments = async (userId: string): Promise<PaymentTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Payment] getUserPayments:", error);
      return [];
    }

    return (data || []) as PaymentTransaction[];
  } catch (error) {
    console.error("[Payment] getUserPayments:", error);
    return [];
  }
};
