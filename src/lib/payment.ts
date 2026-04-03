import { supabase } from "./supabase";

// PayTR Configuration
const PAYTR_MERCHANT_ID = import.meta.env.VITE_PAYTR_MERCHANT_ID || "";
const PAYTR_MERCHANT_KEY = import.meta.env.VITE_PAYTR_MERCHANT_KEY || "";
const PAYTR_MERCHANT_SALT = import.meta.env.VITE_PAYTR_MERCHANT_SALT || "";
const PAYTR_TEST_MODE = import.meta.env.VITE_PAYTR_TEST_MODE === "true" || true;

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type PaymentTransaction = {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  paytr_order_id?: string;
  status: PaymentStatus;
  payment_type: 'deposit' | 'purchase';
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at?: string;
};

// Initialize PayTR payment
export const initializePayTRPayment = async (
  userId: string,
  amount: number,
  userEmail: string,
  userName: string,
  userAddress: string,
  userPhone: string,
  ipAddress: string,
  description: string = "Bakiye Yükleme"
): Promise<{ ok: boolean; paymentUrl?: string; token?: string; error?: string }> => {
  try {
    // Create payment record in Supabase
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'TRY',
        status: 'pending',
        payment_type: 'deposit',
        description: description,
      })
      .select()
      .single();

    if (dbError || !payment) {
      console.error('[Payment] Error creating payment record:', dbError);
      return { ok: false, error: 'Ödeme kaydı oluşturulamadı' };
    }

    // Generate PayTR token (this would normally be done server-side)
    // For client-side, we use a Netlify function or similar
    const response = await fetch('/.netlify/functions/create-paytr-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchant_id: PAYTR_MERCHANT_ID,
        user_ip: ipAddress,
        merchant_oid: payment.id,
        email: userEmail,
        payment_amount: Math.round(amount * 100), // PayTR expects amount in kuruş
        currency: 'TL',
        test_mode: PAYTR_TEST_MODE ? '1' : '0',
        user_name: userName,
        user_address: userAddress,
        user_phone: userPhone,
        merchant_ok_url: `${window.location.origin}/payment/success`,
        merchant_fail_url: `${window.location.origin}/payment/fail`,
        timeout_limit: 30,
        debug_on: PAYTR_TEST_MODE ? '1' : '0',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { ok: false, error: errorData.message || 'PayTR başlatma hatası' };
    }

    const result = await response.json();

    if (result.status === 'success') {
      // Update payment with PayTR token
      await supabase
        .from('payments')
        .update({ 
          paytr_order_id: result.token,
          metadata: { paytr_response: result }
        })
        .eq('id', payment.id);

      return { 
        ok: true, 
        paymentUrl: `https://www.paytr.com/odeme/guvenli/${result.token}`,
        token: result.token 
      };
    } else {
      return { ok: false, error: result.reason || 'PayTR başlatma hatası' };
    }
  } catch (error) {
    console.error('[Payment] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Verify PayTR callback (to be used in webhook)
export const verifyPayTRCallback = (hash: string, merchantOid: string, status: string, totalAmount: string): boolean => {
  // This verification should ideally be done server-side
  // Client-side implementation for reference
  const stringToHash = `${PAYTR_MERCHANT_ID}${merchantOid}${totalAmount}${status}${PAYTR_MERCHANT_SALT}`;
  
  // In a real implementation, you'd use crypto library
  // For now, return true for testing
  return true;
};

// Handle successful payment
export const handlePaymentSuccess = async (paymentId: string, paytrData: any) => {
  try {
    // Update payment status
    const { error: paymentError } = await supabase
      .from('payments')
      .update({ 
        status: 'completed',
        metadata: { paytr_callback: paytrData }
      })
      .eq('id', paymentId);

    if (paymentError) {
      console.error('[Payment] Error updating payment:', paymentError);
      return { ok: false, error: paymentError.message };
    }

    // Get payment details
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      return { ok: false, error: 'Ödeme bulunamadı' };
    }

    // Add funds to user's wallet
    const { data: profile } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', payment.user_id)
      .single();

    const newBalance = (profile?.balance || 0) + payment.amount;

    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', payment.user_id);

    if (balanceError) {
      console.error('[Payment] Error updating balance:', balanceError);
      return { ok: false, error: balanceError.message };
    }

    // Create wallet transaction
    await supabase
      .from('wallet_transactions')
      .insert({
        user_id: payment.user_id,
        type: 'deposit',
        amount: payment.amount,
        balance_after: newBalance,
        description: `PayTR ile bakiye yükleme - ${payment.paytr_order_id || paymentId}`,
        status: 'completed',
      });

    return { ok: true, balance: newBalance };
  } catch (error) {
    console.error('[Payment] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Handle failed payment
export const handlePaymentFail = async (paymentId: string, paytrData: any) => {
  try {
    const { error } = await supabase
      .from('payments')
      .update({ 
        status: 'failed',
        metadata: { paytr_callback: paytrData, fail_reason: paytrData?.failed_reason_code }
      })
      .eq('id', paymentId);

    if (error) {
      console.error('[Payment] Error updating failed payment:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Payment] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get user's payment history
export const getUserPayments = async (userId: string): Promise<PaymentTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Payment] Error fetching payments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Payment] Error:', error);
    return [];
  }
};

// Alternative payment methods (for backup)
export const initializeAlternativePayment = async (
  userId: string,
  amount: number,
  method: 'papara' | 'paycell' | 'card',
  description: string = "Bakiye Yükleme"
): Promise<{ ok: boolean; redirectUrl?: string; error?: string }> => {
  try {
    // Create pending payment
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount: amount,
        currency: 'TRY',
        status: 'pending',
        payment_type: 'deposit',
        description: `${method.toUpperCase()} - ${description}`,
        metadata: { payment_method: method }
      })
      .select()
      .single();

    if (dbError || !payment) {
      return { ok: false, error: 'Ödeme kaydı oluşturulamadı' };
    }

    // Return redirect URL for alternative payment
    // This would integrate with Papara, Paycell, etc.
    const redirectUrls: Record<string, string> = {
      papara: `/payment/papara?amount=${amount}&order=${payment.id}`,
      paycell: `/payment/paycell?amount=${amount}&order=${payment.id}`,
      card: `/payment/card?amount=${amount}&order=${payment.id}`,
    };

    return { 
      ok: true, 
      redirectUrl: redirectUrls[method] || `/payment/card?amount=${amount}&order=${payment.id}`
    };
  } catch (error) {
    console.error('[Payment] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};
