import { supabase } from "@/lib/supabase";
import type { AppUser } from "@/lib/auth";

const LOCAL_FAV_KEY = "itemtr_local_favorite_listing_ids";
const REPORTS_KEY = "itemtr_listing_reports";

const readLocalFavoriteSet = (): Set<string> => {
  try {
    const raw = localStorage.getItem(LOCAL_FAV_KEY);
    const arr = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const writeLocalFavoriteSet = (set: Set<string>) => {
  localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify([...set]));
};

const isUuid = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s));

export const isListingFavorited = async (listingId: string, user: AppUser | null): Promise<boolean> => {
  if (!user || !listingId) return false;
  if (isUuid(listingId)) {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();
    if (error) return false;
    return Boolean(data);
  }
  return readLocalFavoriteSet().has(listingId);
};

/** @returns yeni durum: favoride mi */
export const toggleListingFavorite = async (
  listingId: string,
  user: AppUser,
): Promise<{ ok: boolean; favorited: boolean; error?: string }> => {
  if (!listingId) return { ok: false, favorited: false, error: "Geçersiz ilan" };

  if (isUuid(listingId)) {
    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", listingId)
      .maybeSingle();

    if (existing?.id) {
      const { error } = await supabase.from("favorites").delete().eq("user_id", user.id).eq("listing_id", listingId);
      if (error) return { ok: false, favorited: true, error: error.message };
      return { ok: true, favorited: false };
    }

    const { error } = await supabase.from("favorites").insert({ user_id: user.id, listing_id: listingId });
    if (error) return { ok: false, favorited: false, error: error.message };
    return { ok: true, favorited: true };
  }

  const set = readLocalFavoriteSet();
  const next = !set.has(listingId);
  if (next) set.add(listingId);
  else set.delete(listingId);
  writeLocalFavoriteSet(set);
  return { ok: true, favorited: next };
};

export type ListingReportPayload = {
  listingId: string;
  listingTitle: string;
  reason: string;
  details?: string;
  reporterUsername: string;
  reporterId: string;
};

type StoredReport = ListingReportPayload & { createdAt: string };

export const saveListingReportLocally = (payload: ListingReportPayload) => {
  const row: StoredReport = { ...payload, createdAt: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    const list = raw ? (JSON.parse(raw) as StoredReport[]) : [];
    const next = [row, ...(Array.isArray(list) ? list : [])].slice(0, 200);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(next));
  } catch {
    localStorage.setItem(REPORTS_KEY, JSON.stringify([row]));
  }
};
