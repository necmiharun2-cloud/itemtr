import { supabase } from "./supabase";

export type KycStatus = 'pending' | 'verified' | 'rejected' | 'not_submitted';

export type KycDocument = {
  id: string;
  user_id: string;
  full_name: string;
  id_number: string;
  date_of_birth: string;
  address: string;
  phone: string;
  id_front_image?: string;
  id_back_image?: string;
  selfie_image?: string;
  status: KycStatus;
  rejection_reason?: string;
  submitted_at: string;
  verified_at?: string;
  admin_notes?: string;
};

// Submit KYC verification request
export const submitKycVerification = async (
  userId: string,
  data: Omit<KycDocument, 'id' | 'user_id' | 'status' | 'submitted_at' | 'verified_at' | 'rejection_reason' | 'admin_notes'>
): Promise<{ ok: boolean; error?: string }> => {
  try {
    // Check if user already has a pending KYC
    const { data: existing } = await supabase
      .from('kyc_verifications')
      .select('status')
      .eq('user_id', userId)
      .single();

    if (existing && existing.status === 'pending') {
      return { ok: false, error: 'Zaten bekleyen bir kimlik doğrulama talebiniz var.' };
    }

    if (existing && existing.status === 'verified') {
      return { ok: false, error: 'Kimliğiniz zaten doğrulanmış.' };
    }

    const { error } = await supabase
      .from('kyc_verifications')
      .insert({
        user_id: userId,
        full_name: data.full_name,
        id_number: data.id_number,
        date_of_birth: data.date_of_birth,
        address: data.address,
        phone: data.phone,
        id_front_image: data.id_front_image,
        id_back_image: data.id_back_image,
        selfie_image: data.selfie_image,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      console.error('[KYC] Error submitting:', error);
      return { ok: false, error: error.message };
    }

    // Update user profile to mark KYC as pending
    await supabase
      .from('profiles')
      .update({ is_verified: false })
      .eq('id', userId);

    return { ok: true };
  } catch (error) {
    console.error('[KYC] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get user's KYC status
export const getUserKycStatus = async (userId: string): Promise<{ status: KycStatus; data?: KycDocument }> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return { status: 'not_submitted' };
    }

    return { status: data.status, data };
  } catch (error) {
    console.error('[KYC] Error fetching status:', error);
    return { status: 'not_submitted' };
  }
};

// Get all pending KYC verifications (for admin)
export const getPendingKycVerifications = async (): Promise<KycDocument[]> => {
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*, profiles:user_id(username, email, name)')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('[KYC] Error fetching pending:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[KYC] Error:', error);
    return [];
  }
};

// Approve KYC verification (admin only)
export const approveKycVerification = async (kycId: string, adminNotes?: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { data: kyc, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('user_id')
      .eq('id', kycId)
      .single();

    if (fetchError || !kyc) {
      return { ok: false, error: 'KYC kaydı bulunamadı.' };
    }

    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        admin_notes: adminNotes,
      })
      .eq('id', kycId);

    if (error) {
      console.error('[KYC] Error approving:', error);
      return { ok: false, error: error.message };
    }

    // Update user profile
    await supabase
      .from('profiles')
      .update({ is_verified: true })
      .eq('id', kyc.user_id);

    return { ok: true };
  } catch (error) {
    console.error('[KYC] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Reject KYC verification (admin only)
export const rejectKycVerification = async (kycId: string, reason: string, adminNotes?: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { data: kyc, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('user_id')
      .eq('id', kycId)
      .single();

    if (fetchError || !kyc) {
      return { ok: false, error: 'KYC kaydı bulunamadı.' };
    }

    const { error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        admin_notes: adminNotes,
      })
      .eq('id', kycId);

    if (error) {
      console.error('[KYC] Error rejecting:', error);
      return { ok: false, error: error.message };
    }

    // Update user profile
    await supabase
      .from('profiles')
      .update({ is_verified: false })
      .eq('id', kyc.user_id);

    return { ok: true };
  } catch (error) {
    console.error('[KYC] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get all KYC verifications with filters (admin)
export const getAllKycVerifications = async (filters?: { status?: KycStatus; userId?: string }): Promise<KycDocument[]> => {
  try {
    let query = supabase
      .from('kyc_verifications')
      .select('*, profiles:user_id(username, email, name)')
      .order('submitted_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[KYC] Error fetching:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[KYC] Error:', error);
    return [];
  }
};

// Check if user can withdraw (requires verified KYC)
export const canUserWithdraw = async (userId: string): Promise<{ canWithdraw: boolean; reason?: string }> => {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_verified')
      .eq('id', userId)
      .single();

    if (!profile?.is_verified) {
      return { canWithdraw: false, reason: 'Kimlik doğrulaması gerekiyor. Lütfen hesabınızı doğrulayın.' };
    }

    return { canWithdraw: true };
  } catch (error) {
    console.error('[KYC] Error checking withdraw:', error);
    return { canWithdraw: false, reason: 'Bir hata oluştu' };
  }
};

// Upload KYC document image
export const uploadKycDocument = async (userId: string, file: File, type: 'id_front' | 'id_back' | 'selfie'): Promise<{ ok: boolean; url?: string; error?: string }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, file);

    if (uploadError) {
      console.error('[KYC] Error uploading:', uploadError);
      return { ok: false, error: uploadError.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);

    return { ok: true, url: publicUrl };
  } catch (error) {
    console.error('[KYC] Error:', error);
    return { ok: false, error: 'Dosya yüklenirken bir hata oluştu' };
  }
};
