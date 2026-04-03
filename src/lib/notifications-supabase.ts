import { supabase } from "./supabase";
import type { AppUser } from "./auth";

export type NotificationType = 
  | 'order' 
  | 'message' 
  | 'listing' 
  | 'wallet' 
  | 'kyc' 
  | 'system' 
  | 'review';

export type NotificationItem = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
  metadata?: Record<string, any>;
  created_at: string;
};

// Create a new notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: NotificationType,
  link?: string,
  metadata?: Record<string, any>
): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        is_read: false,
        link,
        metadata,
      });

    if (error) {
      console.error('[Notifications] Error creating:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get user's notifications
export const getUserNotifications = async (userId: string, limit: number = 50): Promise<NotificationItem[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[Notifications] Error fetching:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) {
      console.error('[Notifications] Error marking as read:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[Notifications] Error marking all as read:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[Notifications] Error counting:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return 0;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<{ ok: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('[Notifications] Error deleting:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Notifications] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Subscribe to realtime notifications
export const subscribeToNotifications = (
  userId: string,
  callback: (notification: NotificationItem) => void
) => {
  const subscription = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as NotificationItem);
      }
    )
    .subscribe();

  return subscription;
};

// Helper functions for common notifications
export const notifyNewOrder = async (sellerId: string, buyerName: string, listingTitle: string, orderId: string) => {
  return createNotification(
    sellerId,
    'Yeni Sipariş',
    `${buyerName} adlı kullanıcı "${listingTitle}" ilanınızı satın aldı.`,
    'order',
    `/orders/${orderId}`,
    { orderId, buyerName, listingTitle }
  );
};

export const notifyNewMessage = async (userId: string, senderName: string, message: string, conversationId: string) => {
  return createNotification(
    userId,
    'Yeni Mesaj',
    `${senderName}: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
    'message',
    `/messages/${conversationId}`,
    { conversationId, senderName }
  );
};

export const notifyKycApproved = async (userId: string) => {
  return createNotification(
    userId,
    'Kimlik Doğrulandı',
    'Kimlik doğrulama talebiniz onaylandı. Artık para çekme işlemi yapabilirsiniz.',
    'kyc',
    '/dashboard/settings',
    {}
  );
};

export const notifyKycRejected = async (userId: string, reason: string) => {
  return createNotification(
    userId,
    'Kimlik Doğrulama Reddedildi',
    `Kimlik doğrulama talebiniz reddedildi. Sebep: ${reason}`,
    'kyc',
    '/dashboard/kyc',
    { reason }
  );
};

export const notifyWalletDeposit = async (userId: string, amount: number) => {
  return createNotification(
    userId,
    'Bakiye Yüklendi',
    `Hesabınıza ₺${amount.toFixed(2)} bakiye yüklendi.`,
    'wallet',
    '/dashboard/wallet',
    { amount }
  );
};

export const notifyNewReview = async (sellerId: string, reviewerName: string, rating: number, listingTitle: string) => {
  return createNotification(
    sellerId,
    'Yeni Değerlendirme',
    `${reviewerName} sizi ${rating} yıldız ile değerlendirdi.`,
    'review',
    '/dashboard/reviews',
    { reviewerName, rating, listingTitle }
  );
};

export const notifyListingSold = async (sellerId: string, listingTitle: string, orderId: string) => {
  return createNotification(
    sellerId,
    'İlan Satıldı',
    `"${listingTitle}" ilanınız satıldı.`,
    'listing',
    `/orders/${orderId}`,
    { orderId, listingTitle }
  );
};
