import { supabase } from "./supabase";

export type TransactionType = 'deposit' | 'withdraw' | 'purchase' | 'sale' | 'refund';

export type WalletTransaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  balance_after: number;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

// Get user's wallet transactions from Supabase
export const getWalletTransactions = async (userId: string): Promise<WalletTransaction[]> => {
  try {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Wallet] Error fetching transactions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return [];
  }
};

// Get user balance from Supabase
export const getUserBalance = async (userId: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('[Wallet] Error fetching balance:', error);
      return 0;
    }

    return Number(data?.balance) || 0;
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return 0;
  }
};

// Deposit funds to wallet
export const depositToWallet = async (userId: string, amount: number, description: string = 'Bakiye yüklemesi') => {
  try {
    // Get current balance
    const currentBalance = await getUserBalance(userId);
    const newBalance = currentBalance + amount;

    // Start a transaction
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: amount,
        balance_after: newBalance,
        description,
        status: 'completed',
      });

    if (txError) {
      console.error('[Wallet] Error creating deposit transaction:', txError);
      return { ok: false, error: txError.message };
    }

    // Update profile balance
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (profileError) {
      console.error('[Wallet] Error updating balance:', profileError);
      return { ok: false, error: profileError.message };
    }

    return { ok: true, balance: newBalance };
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Withdraw funds from wallet
export const withdrawFromWallet = async (userId: string, amount: number, description: string = 'Para çekme') => {
  try {
    // Get current balance
    const currentBalance = await getUserBalance(userId);
    
    if (currentBalance < amount) {
      return { ok: false, error: 'Yetersiz bakiye' };
    }

    const newBalance = currentBalance - amount;

    // Create withdrawal transaction
    const { error: txError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type: 'withdraw',
        amount: -amount,
        balance_after: newBalance,
        description,
        status: 'completed',
      });

    if (txError) {
      console.error('[Wallet] Error creating withdrawal transaction:', txError);
      return { ok: false, error: txError.message };
    }

    // Update profile balance
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    if (profileError) {
      console.error('[Wallet] Error updating balance:', profileError);
      return { ok: false, error: profileError.message };
    }

    return { ok: true, balance: newBalance };
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Transfer funds between users (for purchases)
export const transferFunds = async (
  buyerId: string, 
  sellerId: string, 
  amount: number, 
  description: string = 'Satın alma'
) => {
  try {
    // Get buyer's balance
    const buyerBalance = await getUserBalance(buyerId);
    
    if (buyerBalance < amount) {
      return { ok: false, error: 'Yetersiz bakiye' };
    }

    // Get seller's balance
    const sellerBalance = await getUserBalance(sellerId);

    const newBuyerBalance = buyerBalance - amount;
    const newSellerBalance = sellerBalance + amount;

    // Create purchase transaction for buyer
    const { error: buyerTxError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: buyerId,
        type: 'purchase',
        amount: -amount,
        balance_after: newBuyerBalance,
        description,
        status: 'completed',
      });

    if (buyerTxError) {
      console.error('[Wallet] Error creating purchase transaction:', buyerTxError);
      return { ok: false, error: buyerTxError.message };
    }

    // Create sale transaction for seller
    const { error: sellerTxError } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: sellerId,
        type: 'sale',
        amount: amount,
        balance_after: newSellerBalance,
        description: `${description} - Satış`,
        status: 'completed',
      });

    if (sellerTxError) {
      console.error('[Wallet] Error creating sale transaction:', sellerTxError);
      return { ok: false, error: sellerTxError.message };
    }

    // Update buyer's balance
    const { error: buyerError } = await supabase
      .from('profiles')
      .update({ balance: newBuyerBalance })
      .eq('id', buyerId);

    if (buyerError) {
      console.error('[Wallet] Error updating buyer balance:', buyerError);
      return { ok: false, error: buyerError.message };
    }

    // Update seller's balance
    const { error: sellerError } = await supabase
      .from('profiles')
      .update({ balance: newSellerBalance })
      .eq('id', sellerId);

    if (sellerError) {
      console.error('[Wallet] Error updating seller balance:', sellerError);
      return { ok: false, error: sellerError.message };
    }

    return { ok: true, buyerBalance: newBuyerBalance, sellerBalance: newSellerBalance };
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Create pending transaction (for payment processing)
export const createPendingTransaction = async (
  userId: string,
  type: TransactionType,
  amount: number,
  description: string
) => {
  try {
    const currentBalance = await getUserBalance(userId);
    const newBalance = type === 'deposit' ? currentBalance + amount : currentBalance - amount;

    const { data, error } = await supabase
      .from('wallet_transactions')
      .insert({
        user_id: userId,
        type,
        amount,
        balance_after: newBalance,
        description,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[Wallet] Error creating pending transaction:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, transaction: data };
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Complete pending transaction
export const completeTransaction = async (transactionId: string) => {
  try {
    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      return { ok: false, error: 'İşlem bulunamadı' };
    }

    if (transaction.status !== 'pending') {
      return { ok: false, error: 'İşlem zaten tamamlanmış' };
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('wallet_transactions')
      .update({ status: 'completed' })
      .eq('id', transactionId);

    if (updateError) {
      console.error('[Wallet] Error completing transaction:', updateError);
      return { ok: false, error: updateError.message };
    }

    // Update user balance
    const { error: balanceError } = await supabase
      .from('profiles')
      .update({ balance: transaction.balance_after })
      .eq('id', transaction.user_id);

    if (balanceError) {
      console.error('[Wallet] Error updating balance:', balanceError);
      return { ok: false, error: balanceError.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Cancel/fail transaction
export const failTransaction = async (transactionId: string, reason: string = 'İşlem iptal edildi') => {
  try {
    const { error } = await supabase
      .from('wallet_transactions')
      .update({ 
        status: 'failed',
        description: reason,
      })
      .eq('id', transactionId);

    if (error) {
      console.error('[Wallet] Error failing transaction:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Wallet] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};
