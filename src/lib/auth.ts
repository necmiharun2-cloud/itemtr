import { applyLevelReward, createInitialLevelState, getLevelTier, type LevelAction, type LevelState } from "@/lib/levels";
import { safeJSONParse } from "@/lib/utils";
import { supabase } from "./supabase";

export type UserRole = "user" | "admin";

export type AppUser = {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  password?: string;
  phone: string;
  avatar: string;
  balance: number;
  rating: number;
  isVerified: boolean;
  about: string;
  smsSecurityEnabled: boolean;
  bankAccountAdded: boolean;
  levelState: LevelState;
  createdAt: string;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

const USERS_KEY = "itemtr_auth_users";
const SESSION_KEY = "itemtr_auth_session";
export const AUTH_CHANGED_EVENT = "itemtr-auth-changed";

const nowIso = () => new Date().toISOString();
const makeAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeUsername = (value: string) => value.trim().toLowerCase();

const enrichUser = (user: Partial<AppUser>): AppUser => ({
  id: user.id || crypto.randomUUID(),
  role: (user.role as UserRole) || "user",
  name: user.name || user.username || user.email?.split("@")[0] || "Kullanıcı",
  username: user.username || user.email?.split("@")[0] || `user-${Math.random().toString(36).slice(2, 8)}`,
  email: user.email || "",
  password: user.password,
  phone: user.phone || "",
  avatar: user.avatar || makeAvatar(user.name || user.username || "User"),
  balance: Number(user.balance) || 0,
  rating: Number(user.rating) || 5,
  isVerified: Boolean(user.isVerified),
  about: user.about || "",
  smsSecurityEnabled: Boolean(user.smsSecurityEnabled),
  bankAccountAdded: Boolean(user.bankAccountAdded),
  levelState: user.levelState || createInitialLevelState(),
  createdAt: user.createdAt || nowIso(),
});

const defaultAdmin = (): AppUser =>
  enrichUser({
    id: "admin-root",
    role: "admin",
    name: "Admin Kullanıcı",
    username: "admin",
    email: "admin@itemtr.com",
    password: import.meta.env.VITE_ADMIN_PASSWORD || "ItemTR2024!Secure",
    phone: "0532 999 99 99",
    avatar: makeAvatar("Admin"),
    balance: 25000,
    rating: 5,
    isVerified: true,
    about: "Platform yöneticisi",
    smsSecurityEnabled: true,
    bankAccountAdded: true,
    levelState: {
      xp: 1500,
      counts: {
        register: 1,
        email_verified: 1,
        phone_verified: 1,
        identity_verified: 1,
        first_avatar_upload: 1,
        first_deposit: 1,
        first_listing: 1,
        about_completed: 1,
        sms_security: 1,
        bank_account_added: 1,
        deposit: 12,
        listing_sale: 24,
        purchase: 8,
        review: 6,
        vitrin_purchase: 4,
      },
      history: [],
    },
  });

const defaultDemoUser = (): AppUser => {
  let levelState = createInitialLevelState();
  ["register", "email_verified", "phone_verified", "first_avatar_upload", "first_deposit", "deposit", "first_listing", "about_completed"].forEach((action) => {
    levelState = applyLevelReward(levelState, action as LevelAction).state;
  });

  return enrichUser({
    id: "demo-user",
    role: "user",
    name: "Demo Kullanıcı",
    username: "demouser",
    email: "demo@itemtr.com",
    password: import.meta.env.VITE_DEMO_PASSWORD || "Demo2024!Secure",
    phone: "0532 000 00 00",
    avatar: makeAvatar("Demo"),
    balance: 1250,
    rating: 4.8,
    isVerified: false,
    about: "Dijital ürün satışı yapan aktif kullanıcı.",
    levelState,
  });
};

const emitAuthChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  window.dispatchEvent(new Event("storage"));
};

const writeLegacyState = (user: AppUser | null) => {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem("itemtr_user_profile");
    localStorage.removeItem("itemtr_user_role");
    return;
  }

  localStorage.setItem(
    "itemtr_user_profile",
    JSON.stringify({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      balance: user.balance,
      rating: user.rating,
      isVerified: user.isVerified,
      about: user.about,
      levelState: user.levelState,
    }),
  );
  localStorage.setItem("itemtr_user_role", user.role);
};

const getUsersRaw = (): AppUser[] => {
  if (typeof window === "undefined") return [];
  return safeJSONParse<AppUser[]>(localStorage.getItem(USERS_KEY), []).map(enrichUser);
};

const saveUsers = (users: AppUser[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const upsertLocalUser = (user: AppUser) => {
  const users = getUsersRaw();
  const next = users.some((item) => item.id === user.id)
    ? users.map((item) => (item.id === user.id ? enrichUser({ ...item, ...user }) : item))
    : [...users, enrichUser(user)];
  saveUsers(next);
};

const cacheSession = (user: AppUser | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(SESSION_KEY, user.id);
    writeLegacyState(user);
  } else {
    localStorage.removeItem(SESSION_KEY);
    writeLegacyState(null);
  }
};

const setSession = (user: AppUser | null) => {
  cacheSession(user);
  emitAuthChange();
};

const mapSupabaseUser = async (authUser: any): Promise<AppUser> => {
  const fallback = enrichUser({
    id: authUser.id,
    role: authUser.user_metadata?.role || "user",
    name: authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Kullanıcı",
    username: authUser.user_metadata?.username || authUser.email?.split("@")[0] || authUser.id.slice(0, 8),
    email: authUser.email || "",
    phone: authUser.user_metadata?.phone || "",
    avatar: authUser.user_metadata?.avatar || makeAvatar(authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User"),
    balance: Number(authUser.user_metadata?.balance) || 0,
    rating: Number(authUser.user_metadata?.rating) || 5,
    isVerified: Boolean(authUser.user_metadata?.isVerified),
    about: authUser.user_metadata?.about || "",
    smsSecurityEnabled: Boolean(authUser.user_metadata?.smsSecurityEnabled),
    bankAccountAdded: Boolean(authUser.user_metadata?.bankAccountAdded),
    levelState: authUser.user_metadata?.levelState || createInitialLevelState(),
    createdAt: authUser.created_at || nowIso(),
  });

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (!profile) return fallback;

    return enrichUser({
      ...fallback,
      role: (profile.role as UserRole) || fallback.role,
      name: profile.name || fallback.name,
      username: profile.username || fallback.username,
      email: profile.email || fallback.email,
      phone: profile.phone || fallback.phone,
      avatar: profile.avatar || fallback.avatar,
      balance: Number(profile.balance) || fallback.balance,
      rating: Number(profile.rating) || fallback.rating,
      isVerified: Boolean(profile.is_verified),
      about: profile.about || fallback.about,
      smsSecurityEnabled: Boolean(profile.sms_security_enabled),
      bankAccountAdded: Boolean(profile.bank_account_added),
      levelState: profile.level_xp ? { xp: Number(profile.level_xp), counts: {}, history: [] } : fallback.levelState,
      createdAt: profile.created_at || fallback.createdAt,
    });
  } catch {
    return fallback;
  }
};

const tryEnsureSupabaseProfile = async (authUser: any, payload?: Partial<AppUser>) => {
  try {
    await supabase.from("profiles").upsert(
      {
        id: authUser.id,
        username: payload?.username || authUser.user_metadata?.username || authUser.email?.split("@")[0] || authUser.id.slice(0, 8),
        name: payload?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "Kullanıcı",
        email: payload?.email || authUser.email || "",
        phone: payload?.phone || "",
        avatar: payload?.avatar || makeAvatar(payload?.name || payload?.username || authUser.email?.split("@")[0] || "User"),
        role: payload?.role || authUser.user_metadata?.role || "user",
        balance: payload?.balance ?? 0,
        rating: payload?.rating ?? 5,
        is_verified: payload?.isVerified ?? false,
        about: payload?.about || "",
        sms_security_enabled: payload?.smsSecurityEnabled ?? false,
        bank_account_added: payload?.bankAccountAdded ?? false,
        level_xp: payload?.levelState?.xp ?? 0,
        updated_at: nowIso(),
      },
      { onConflict: "id" },
    );
  } catch {
    // Trigger or existing RLS setup may already manage this.
  }
};

const findLocalUserByIdentifier = (identifier: string) => {
  const normalized = identifier.trim().toLowerCase();
  return getUsersRaw().find(
    (user) => normalizeEmail(user.email) === normalized || normalizeUsername(user.username) === normalized,
  ) || null;
};

export const seedAuth = () => {
  if (typeof window === "undefined") return;
  const existing = getUsersRaw();
  if (existing.length === 0) {
    saveUsers([defaultAdmin(), defaultDemoUser()]);
  }

  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    writeLegacyState(null);
    return;
  }

  const sessionUser = getUsersRaw().find((user) => user.id === sessionId) || null;
  writeLegacyState(sessionUser);
};

export const getUsers = (): AppUser[] => {
  seedAuth();
  return getUsersRaw();
};

export const getCurrentUser = async (): Promise<AppUser | null> => {
  if (typeof window === "undefined") return null;
  seedAuth();

  const hydrateFromAuthUser = async (authUser: import("@supabase/supabase-js").User | null) => {
    if (!authUser) return null;
    try {
      const appUser = await mapSupabaseUser(authUser);
      upsertLocalUser(appUser);
      cacheSession(appUser);
      return appUser;
    } catch {
      return null;
    }
  };

  // Önce yerel oturum (hızlı); getUser() sunucuya gider ve yavaş/kilitli ağda yüzeyi kilitleyebilir.
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const fromSession = await hydrateFromAuthUser(sessionData.session?.user ?? null);
    if (fromSession) {
      void supabase.auth.getUser().catch(() => {});
      return fromSession;
    }
  } catch {
    // Devam: getUser veya local
  }

  try {
    const { data } = await supabase.auth.getUser();
    const fromUser = await hydrateFromAuthUser(data.user ?? null);
    if (fromUser) return fromUser;
  } catch {
    // Fall back to local session.
  }

  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    writeLegacyState(null);
    return null;
  }

  const localUser = getUsersRaw().find((user) => user.id === sessionId) || null;
  writeLegacyState(localUser);
  return localUser;
};

export const isAuthenticated = async () => Boolean(await getCurrentUser());

export const signUpUser = async ({ username, email, password, name }: RegisterPayload) => {
  seedAuth();
  const cleanUsername = username.trim();
  const cleanEmail = normalizeEmail(email);
  const displayName = name?.trim() || cleanUsername;

  if (getUsersRaw().some((user) => normalizeUsername(user.username) === normalizeUsername(cleanUsername))) {
    return { ok: false as const, error: "Bu kullanıcı adı zaten kullanılıyor." };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
          name: displayName,
          role: "user",
        },
      },
    });

    if (error) {
      return { ok: false as const, error: error.message };
    }

    if (!data.user) {
      return { ok: false as const, error: "Kayıt işlemi tamamlanamadı." };
    }

    await tryEnsureSupabaseProfile(data.user, {
      username: cleanUsername,
      name: displayName,
      email: cleanEmail,
      avatar: makeAvatar(displayName),
      role: "user",
      balance: 0,
      rating: 5,
      isVerified: false,
      levelState: applyLevelReward(createInitialLevelState(), "register").state,
    });

    const appUser = enrichUser({
      id: data.user.id,
      role: "user",
      name: displayName,
      username: cleanUsername,
      email: cleanEmail,
      avatar: makeAvatar(displayName),
      balance: 0,
      rating: 5,
      isVerified: false,
      levelState: applyLevelReward(createInitialLevelState(), "register").state,
      createdAt: data.user.created_at || nowIso(),
    });

    upsertLocalUser(appUser);

    const requiresEmailVerification = !data.session;
    if (!requiresEmailVerification) {
      setSession(appUser);
    } else {
      writeLegacyState(null);
      emitAuthChange();
    }

    return {
      ok: true as const,
      user: appUser,
      requiresEmailVerification,
      message: requiresEmailVerification
        ? "Hesabın oluşturuldu. Devam etmek için e-posta adresini doğrulaman gerekiyor."
        : "Hesabın oluşturuldu. Giriş yaptın.",
    };
  } catch (error) {
    console.error("[Auth] Signup error:", error);
  }

  const fallbackUser = enrichUser({
    id: crypto.randomUUID(),
    role: "user",
    name: displayName,
    username: cleanUsername,
    email: cleanEmail,
    password,
    avatar: makeAvatar(displayName),
    balance: 0,
    rating: 5,
    isVerified: false,
    levelState: applyLevelReward(createInitialLevelState(), "register").state,
  });

  upsertLocalUser(fallbackUser);
  setSession(fallbackUser);
  return {
    ok: true as const,
    user: fallbackUser,
    requiresEmailVerification: false,
    message: "Hesabın oluşturuldu. Giriş yaptın.",
  };
};

export const registerUser = async ({ username, email, password, name }: RegisterPayload) => {
  return signUpUser({ username, email, password, name });
};

export const loginUser = async (identifier: string, password: string) => {
  seedAuth();
  const trimmedIdentifier = identifier.trim();
  const localMatch = findLocalUserByIdentifier(trimmedIdentifier);

  let email = trimmedIdentifier;
  if (!trimmedIdentifier.includes("@")) {
    if (localMatch?.email) {
      email = localMatch.email;
    } else {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("username", trimmedIdentifier)
          .single();
        if (profile?.email) {
          email = profile.email;
        }
      } catch {
        // local fallback below
      }
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      return { ok: false as const, error: "Giriş yapılamadı." };
    }

    const appUser = await mapSupabaseUser(data.user);
    upsertLocalUser(appUser);
    setSession(appUser);
    return { ok: true as const, user: appUser };
  } catch (error: any) {
    if (localMatch && localMatch.password === password) {
      setSession(localMatch);
      return { ok: true as const, user: localMatch };
    }

    const message = typeof error?.message === "string" ? error.message.toLowerCase() : "";
    if (message.includes("email not confirmed")) {
      return { ok: false as const, error: "E-posta adresinizi doğrulamadan giriş yapamazsınız." };
    }

    return { ok: false as const, error: "E-posta/kullanıcı adı veya şifre hatalı." };
  }
};

export const logoutUser = async () => {
  try {
    await supabase.auth.signOut();
  } catch {
    // local session cleanup below will still run
  }

  localStorage.removeItem("itemtr_user_listings");
  localStorage.removeItem("itemtr_wallet_txns");
  localStorage.removeItem("itemtr_vitrin_package");
  localStorage.removeItem("itemtr_conversations");
  localStorage.removeItem("itemtr_notifications");
  localStorage.removeItem("itemtr_checkout_listing");
  setSession(null);
};

export const updateUser = async (userId: string, updater: (user: AppUser) => AppUser) => {
  const current = await getCurrentUser();
  const target = getUsersRaw().find((user) => user.id === userId) || current;
  if (!target || target.id !== userId) return null;

  const updatedUser = enrichUser(updater(target));
  upsertLocalUser(updatedUser);

  try {
    await supabase.from("profiles").upsert(
      {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        balance: updatedUser.balance,
        rating: updatedUser.rating,
        is_verified: updatedUser.isVerified,
        about: updatedUser.about,
        sms_security_enabled: updatedUser.smsSecurityEnabled,
        bank_account_added: updatedUser.bankAccountAdded,
        level_xp: updatedUser.levelState.xp,
        updated_at: nowIso(),
      },
      { onConflict: "id" },
    );
  } catch {
    // Local state remains source of truth if DB update fails.
  }

  const supabaseUser = await getCurrentUser();
  if (supabaseUser && supabaseUser.id === updatedUser.id) {
    setSession(updatedUser);
  } else {
    writeLegacyState(updatedUser);
    emitAuthChange();
  }

  return updatedUser;
};

export const updateCurrentUser = async (updater: (user: AppUser) => AppUser) => {
  const current = await getCurrentUser();
  if (!current) return null;
  return updateUser(current.id, updater);
};

export const rewardCurrentUser = async (action: LevelAction) => {
  const current = await getCurrentUser();
  if (!current) return { awardedXp: 0, user: null as AppUser | null, label: "" };

  const reward = applyLevelReward(current.levelState, action);
  if (reward.awardedXp === 0) {
    return { awardedXp: 0, user: current, label: reward.label };
  }

  const updatedUser = await updateUser(current.id, (user) => ({
    ...user,
    levelState: reward.state,
  }));

  return {
    awardedXp: reward.awardedXp,
    user: updatedUser,
    label: reward.label,
  };
};

export const getCurrentLevelInfo = async () => {
  const current = await getCurrentUser();
  return current ? getLevelTier(current.levelState.xp) : getLevelTier(0);
};
