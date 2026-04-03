import { supabase } from "./supabase";

export type StoreType = 'vitrin' | 'highlight' | 'urgent' | 'auto_bump' | 'featured';

export type StoreSubscription = {
  id: string;
  user_id: string;
  listing_id: string;
  store_type: StoreType;
  start_date: string;
  end_date: string;
  price: number;
  is_active: boolean;
  created_at: string;
};

export type StorePackage = {
  id: string;
  name: string;
  type: StoreType;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  color: string;
  icon: string;
};

// Store packages configuration
export const STORE_PACKAGES: StorePackage[] = [
  {
    id: 'vitrin_7',
    name: 'Vitrin İlanı',
    type: 'vitrin',
    description: 'İlanınız ana sayfa vitrin alanında görüntülenir.',
    price: 49,
    duration_days: 7,
    features: ['Ana sayfa vitrin alanı', '7 gün süre', 'Daha fazla görüntülenme', 'Özel rozet'],
    color: 'bg-purple-500',
    icon: 'star',
  },
  {
    id: 'vitrin_30',
    name: 'Vitrin İlanı (Aylık)',
    type: 'vitrin',
    description: 'İlanınız 30 gün boyunca vitrinde kalır.',
    price: 149,
    duration_days: 30,
    features: ['Ana sayfa vitrin alanı', '30 gün süre', 'Daha fazla görüntülenme', 'Özel rozet', '%20 indirim'],
    color: 'bg-purple-500',
    icon: 'star',
  },
  {
    id: 'highlight_7',
    name: 'Renkli Vurgu',
    type: 'highlight',
    description: 'İlanınız renkli arka plan ile dikkat çeker.',
    price: 29,
    duration_days: 7,
    features: ['Renkli arka plan', '7 gün süre', 'Liste görünümünde öne çıkma'],
    color: 'bg-yellow-500',
    icon: 'paint',
  },
  {
    id: 'urgent_7',
    name: 'Acil İlan',
    type: 'urgent',
    description: 'İlanınız "ACİL" etiketi ile gösterilir.',
    price: 19,
    duration_days: 7,
    features: ['ACİL etiketi', '7 gün süre', 'Öncelikli sıralama'],
    color: 'bg-red-500',
    icon: 'alert',
  },
  {
    id: 'auto_bump_30',
    name: 'Otomatik Yukarı Taşıma',
    type: 'auto_bump',
    description: 'İlanınız her gün otomatik yukarı taşınır.',
    price: 39,
    duration_days: 30,
    features: ['Her gün otomatik yukarı taşıma', '30 gün süre', 'Sürekli üst sıralarda görünüm'],
    color: 'bg-blue-500',
    icon: 'trending',
  },
  {
    id: 'featured_7',
    name: 'Öne Çıkan İlan',
    type: 'featured',
    description: 'İlanınız kategori sayfalarında öne çıkarılır.',
    price: 59,
    duration_days: 7,
    features: ['Kategori sayfalarında öne çıkma', '7 gün süre', 'Ana sayfada görünüm'],
    color: 'bg-green-500',
    icon: 'zap',
  },
];

// Subscribe to store package
export const subscribeToStore = async (
  userId: string,
  listingId: string,
  packageId: string
): Promise<{ ok: boolean; subscription?: StoreSubscription; error?: string }> => {
  try {
    const pkg = STORE_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      return { ok: false, error: 'Paket bulunamadı.' };
    }

    // Check user balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return { ok: false, error: 'Kullanıcı bilgisi alınamadı.' };
    }

    if (profile.balance < pkg.price) {
      return { ok: false, error: 'Yetersiz bakiye. Lütfen bakiye yükleyin.' };
    }

    // Check if listing already has active subscription of same type
    const { data: existing } = await supabase
      .from('store_subscriptions')
      .select('*')
      .eq('listing_id', listingId)
      .eq('store_type', pkg.type)
      .eq('is_active', true)
      .single();

    if (existing) {
      return { ok: false, error: 'Bu ilan için zaten aktif bir paket var.' };
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + pkg.duration_days);

    // Create subscription
    const { data: subscription, error: subError } = await supabase
      .from('store_subscriptions')
      .insert({
        user_id: userId,
        listing_id: listingId,
        store_type: pkg.type,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        price: pkg.price,
        is_active: true,
      })
      .select()
      .single();

    if (subError) {
      console.error('[Store] Error creating subscription:', subError);
      return { ok: false, error: subError.message };
    }

    // Deduct balance
    const newBalance = profile.balance - pkg.price;
    await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', userId);

    // Update listing based on store type
    const updates: any = {};
    if (pkg.type === 'vitrin') {
      updates.is_vitrin = true;
      updates.section = 'vitrin';
    }
    if (pkg.type === 'highlight') {
      updates.is_highlighted = true;
    }
    if (pkg.type === 'urgent') {
      updates.is_urgent = true;
    }
    if (pkg.type === 'featured') {
      updates.is_featured = true;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('listings')
        .update(updates)
        .eq('id', listingId);
    }

    return { ok: true, subscription };
  } catch (error) {
    console.error('[Store] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get user's active subscriptions
export const getUserSubscriptions = async (userId: string): Promise<StoreSubscription[]> => {
  try {
    const { data, error } = await supabase
      .from('store_subscriptions')
      .select('*, listings:listing_id(title)')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('end_date', { ascending: true });

    if (error) {
      console.error('[Store] Error fetching subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Store] Error:', error);
    return [];
  }
};

// Get listing's active subscriptions
export const getListingSubscriptions = async (listingId: string): Promise<StoreSubscription[]> => {
  try {
    const { data, error } = await supabase
      .from('store_subscriptions')
      .select('*')
      .eq('listing_id', listingId)
      .eq('is_active', true);

    if (error) {
      console.error('[Store] Error fetching listing subscriptions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('[Store] Error:', error);
    return [];
  }
};

// Check and deactivate expired subscriptions
export const checkExpiredSubscriptions = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();

    // Get expired subscriptions
    const { data: expired, error } = await supabase
      .from('store_subscriptions')
      .select('*')
      .eq('is_active', true)
      .lt('end_date', now);

    if (error || !expired) return;

    for (const sub of expired) {
      // Deactivate subscription
      await supabase
        .from('store_subscriptions')
        .update({ is_active: false })
        .eq('id', sub.id);

      // Update listing
      const updates: any = {};
      if (sub.store_type === 'vitrin') {
        updates.is_vitrin = false;
        updates.section = 'new';
      }
      if (sub.store_type === 'highlight') {
        updates.is_highlighted = false;
      }
      if (sub.store_type === 'urgent') {
        updates.is_urgent = false;
      }
      if (sub.store_type === 'featured') {
        updates.is_featured = false;
      }

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('listings')
          .update(updates)
          .eq('id', sub.listing_id);
      }
    }
  } catch (error) {
    console.error('[Store] Error checking expired:', error);
  }
};

// Calculate store stats for admin
export const getStoreStats = async () => {
  try {
    const { data: activeSubs, error: activeError } = await supabase
      .from('store_subscriptions')
      .select('store_type, price', { count: 'exact' })
      .eq('is_active', true);

    if (activeError) {
      return { totalActive: 0, revenue: 0, byType: {} };
    }

    const totalActive = activeSubs?.length || 0;
    const revenue = activeSubs?.reduce((sum, sub) => sum + (sub.price || 0), 0) || 0;

    const byType: Record<string, number> = {};
    activeSubs?.forEach(sub => {
      byType[sub.store_type] = (byType[sub.store_type] || 0) + 1;
    });

    return { totalActive, revenue, byType };
  } catch (error) {
    console.error('[Store] Error getting stats:', error);
    return { totalActive: 0, revenue: 0, byType: {} };
  }
};

// Auto bump listings with active auto_bump subscription
export const autoBumpListings = async (): Promise<void> => {
  try {
    const now = new Date().toISOString();

    // Get active auto_bump subscriptions
    const { data: subs, error } = await supabase
      .from('store_subscriptions')
      .select('listing_id')
      .eq('store_type', 'auto_bump')
      .eq('is_active', true);

    if (error || !subs) return;

    for (const sub of subs) {
      // Update listing updated_at to bump it
      await supabase
        .from('listings')
        .update({ updated_at: now })
        .eq('id', sub.listing_id);
    }
  } catch (error) {
    console.error('[Store] Error auto bumping:', error);
  }
};
