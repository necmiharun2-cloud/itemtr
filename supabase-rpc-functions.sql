-- ============================================
-- RPC ATOMIC TRANSFER FONKSİYONU
-- ============================================

-- Güvenli para transferi fonksiyonu (Atomic Transaction)
CREATE OR REPLACE FUNCTION public.transfer_funds_atomic(
  p_buyer_id UUID,
  p_seller_id UUID,
  p_amount DECIMAL,
  p_description TEXT DEFAULT 'İşlem'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_buyer_balance DECIMAL;
  v_new_buyer_balance DECIMAL;
  v_new_seller_balance DECIMAL;
  v_listing_id UUID;
BEGIN
  -- 1. Alıcı bakiyesini kilitle ve kontrol et
  SELECT balance INTO v_buyer_balance
  FROM profiles
  WHERE id = p_buyer_id
  FOR UPDATE;  -- Row lock
  
  IF v_buyer_balance IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Alıcı bulunamadı'
    );
  END IF;
  
  IF v_buyer_balance < p_amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Yetersiz bakiye'
    );
  END IF;
  
  -- 2. Alıcıdan düş
  v_new_buyer_balance := v_buyer_balance - p_amount;
  UPDATE profiles 
  SET balance = v_new_buyer_balance,
      updated_at = NOW()
  WHERE id = p_buyer_id;
  
  -- 3. Satıcıya ekle (satıcı bakiyesini kilitle)
  UPDATE profiles 
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE id = p_seller_id
  RETURNING balance INTO v_new_seller_balance;
  
  -- 4. Alıcı işlem kaydı
  INSERT INTO wallet_transactions (
    user_id, type, amount, balance_after, 
    description, status, created_at
  ) VALUES (
    p_buyer_id, 'purchase', -p_amount, v_new_buyer_balance,
    p_description, 'completed', NOW()
  );
  
  -- 5. Satıcı işlem kaydı
  INSERT INTO wallet_transactions (
    user_id, type, amount, balance_after,
    description, status, created_at
  ) VALUES (
    p_seller_id, 'sale', p_amount, v_new_seller_balance,
    p_description, 'completed', NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'buyer_balance', v_new_buyer_balance,
    'seller_balance', v_new_seller_balance,
    'amount', p_amount
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Hata durumunda tüm değişiklikler otomatik rollback edilir
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
END;
$$;

-- ============================================
-- PROFILES TABLOSUNA STATUS KOLONU EKLE (Eğer yoksa)
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'status') THEN
    ALTER TABLE profiles ADD COLUMN status TEXT DEFAULT 'active';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'profiles' AND column_name = 'ban_reason') THEN
    ALTER TABLE profiles ADD COLUMN ban_reason TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'listings' AND column_name = 'rejection_reason') THEN
    ALTER TABLE listings ADD COLUMN rejection_reason TEXT;
  END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
