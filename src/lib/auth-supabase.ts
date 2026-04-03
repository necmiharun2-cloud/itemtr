import { applyLevelReward, createInitialLevelState, getLevelTier, type LevelAction, type LevelState } from "@/lib/levels";
import { safeJSONParse } from "@/lib/utils";
import { supabase, signIn, signUp, signOut, getCurrentUser as getSupabaseUser, getSession } from "@/lib/supabase";

export type UserRole = "user" | "admin";

export type AppUser = {
  id: string;
  role: UserRole;
  name: string;
  username: string;
  email: string;
  password?: string; // Optional for Supabase Auth
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

const enrichUser = (user: any): AppUser => {
  if (!user) return {} as AppUser;
  return {
    ...user,
    levelState: user?.levelState || createInitialLevelState(),
  };
};

// GÜVENLİK: Canlıya çıkmadan önce bu şifreyi değiştir!
// Üretim ortamında: VITE_ADMIN_PASSWORD ortam değişkeni ayarlanmalı
const getAdminPassword = (): string => {
  // Önce ortam değişkenine bak
  const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
  if (envPassword) return envPassword;
  
  // Geliştirme ortamında varsayılan (CANLIYA ÇIKMADAN ÖNCE DEĞİŞTİR!)
  console.warn("[GÜVENLİK] VITE_ADMIN_PASSWORD tanımlanmamış! Varsayılan şifre kullanılıyor.");
  return "ItemTR2024!Secure";
};

const defaultAdmin = (): AppUser => ({
  id: "admin-root",
  role: "admin",
  name: "Admin Kullanıcı",
  username: "admin",
  email: "admin@itemtr.com",
  password: getAdminPassword(),
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
  createdAt: nowIso(),
});

// GÜVENLİK: Demo kullanıcı şifresi ortam değişkeninden alınmalı veya canlıda kaldırılmalı
const getDemoPassword = (): string => {
  const envPassword = import.meta.env.VITE_DEMO_PASSWORD;
  if (envPassword) return envPassword;
  return "Demo2024!Secure";
};

const defaultDemoUser = (): AppUser => {
  let levelState = createInitialLevelState();
  ["register", "email_verified", "phone_verified", "first_avatar_upload", "first_deposit", "deposit", "first_listing", "about_completed"].forEach((action) => {
    levelState = applyLevelReward(levelState, action as LevelAction).state;
  });

  return {
    id: "demo-user",
    role: "user",
    name: "Demo Kullanıcı",
    username: "DemoUser",
    email: "demo@itemtr.com",
    password: getDemoPassword(),
    phone: "0532 000 00 00",
    avatar: makeAvatar("Mert"),
    balance: 1250,
    rating: 4.8,
    isVerified: false,
    about: "Dijital ürün satışı yapan aktif kullanıcı.",
    smsSecurityEnabled: false,
    bankAccountAdded: false,
    levelState,
    createdAt: nowIso(),
  };
};

// Legacy localStorage functions for fallback
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

const emitAuthChange = () => {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  window.dispatchEvent(new Event("storage"));
};

// ============================================
// SUPABASE AUTH FUNCTIONS
// ============================================

// Get current user (Supabase or localStorage fallback)
export const getCurrentUser = async (): Promise<AppUser | null> => {
  if (typeof window === "undefined") return null;
  
  // Try Supabase first
  try {
    const supabaseUser = await getSupabaseUser();
    if (supabaseUser) {
      // Convert Supabase user to AppUser format
      const appUser: AppUser = {
        id: supabaseUser.id,
        role: (supabaseUser.user_metadata?.role as UserRole) || "user",
        name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || "",
        username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || "",
        email: supabaseUser.email || "",
        phone: supabaseUser.user_metadata?.phone || "",
        avatar: supabaseUser.user_metadata?.avatar || makeAvatar(supabaseUser.email?.split('@')[0] || ""),
        balance: Number(supabaseUser.user_metadata?.balance) || 0,
        rating: Number(supabaseUser.user_metadata?.rating) || 5,
        isVerified: Boolean(supabaseUser.user_metadata?.isVerified) || false,
        about: supabaseUser.user_metadata?.about || "",
        smsSecurityEnabled: Boolean(supabaseUser.user_metadata?.smsSecurityEnabled) || false,
        bankAccountAdded: Boolean(supabaseUser.user_metadata?.bankAccountAdded) || false,
        levelState: supabaseUser.user_metadata?.levelState || createInitialLevelState(),
        createdAt: supabaseUser.created_at || nowIso(),
      };
      
      writeLegacyState(appUser);
      return appUser;
    }
  } catch (error) {
    console.warn("[Auth] Supabase user fetch failed, using localStorage fallback");
  }
  
  // Fallback to localStorage
  const sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    writeLegacyState(null);
    return null;
  }
  
  const users = getUsersRaw();
  const user = users.find((item) => item.id === sessionId) || null;
  if (user) writeLegacyState(user);
  return user;
};

export const isAuthenticated = async () => Boolean(await getCurrentUser());

// Sign up with Supabase
export const signUpUser = async ({ username, email, password, name }: RegisterPayload) => {
  try {
    const { data, error } = await signUp(email, password, {
      username,
      name: name?.trim() || username,
      role: "user"
    });
    
    if (error) {
      console.error("[Auth] Supabase signup failed:", error);
      return { ok: false as const, error: error.message };
    }
    
    if (data.user) {
      // Create profile in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          username: username.trim(),
          name: name?.trim() || username,
          email: email,
          avatar: makeAvatar(username),
          balance: 0,
          rating: 5,
          role: 'user',
          status: 'active',
          is_verified: false,
          sms_security_enabled: false,
          bank_account_added: false,
          level_xp: 0,
          created_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error("[Auth] Profile creation failed:", profileError);
        // Don't fail signup if profile creation fails - trigger should handle it
      }
      
      const appUser: AppUser = {
        id: data.user.id,
        role: "user",
        name: name?.trim() || username,
        username: username.trim(),
        email: email,
        phone: "",
        avatar: makeAvatar(username),
        balance: 0,
        rating: 5,
        isVerified: false,
        about: "",
        smsSecurityEnabled: false,
        bankAccountAdded: false,
        levelState: createInitialLevelState(),
        createdAt: data.user.created_at || nowIso(),
      };
      
      writeLegacyState(appUser);
      emitAuthChange();
      return { ok: true as const, user: appUser };
    }
    
    return { ok: false as const, error: "Signup failed" };
  } catch (error) {
    console.error("[Auth] Signup error:", error);
    return { ok: false as const, error: "An error occurred" };
  }
};

// Sign in with Supabase
export const loginUser = async (identifier: string, password: string) => {
  try {
    const { data, error } = await signIn(identifier, password);
    
    if (error) {
      console.error("[Auth] Supabase signin failed:", error);
      return { ok: false as const, error: error.message };
    }
    
    if (data.user) {
      const appUser: AppUser = {
        id: data.user.id,
        role: (data.user.user_metadata?.role as UserRole) || "user",
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || "",
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || "",
        email: data.user.email || "",
        phone: data.user.user_metadata?.phone || "",
        avatar: data.user.user_metadata?.avatar || makeAvatar(data.user.email?.split('@')[0] || ""),
        balance: Number(data.user.user_metadata?.balance) || 0,
        rating: Number(data.user.user_metadata?.rating) || 5,
        isVerified: Boolean(data.user.user_metadata?.isVerified) || false,
        about: data.user.user_metadata?.about || "",
        smsSecurityEnabled: Boolean(data.user.user_metadata?.smsSecurityEnabled) || false,
        bankAccountAdded: Boolean(data.user.user_metadata?.bankAccountAdded) || false,
        levelState: data.user.user_metadata?.levelState || createInitialLevelState(),
        createdAt: data.user.created_at || nowIso(),
      };
      
      localStorage.setItem(SESSION_KEY, appUser.id);
      writeLegacyState(appUser);
      emitAuthChange();
      return { ok: true as const, user: appUser };
    }
    
    return { ok: false as const, error: "Login failed" };
  } catch (error) {
    console.error("[Auth] Login error:", error);
    return { ok: false as const, error: "An error occurred" };
  }
};

// Sign out with Supabase
export const logoutUser = async () => {
  try {
    const { error } = await signOut();
    if (error) {
      console.error("[Auth] Supabase signout failed:", error);
    }
    
    // Clear localStorage
    localStorage.removeItem(SESSION_KEY);
    writeLegacyState(null);
    emitAuthChange();
  } catch (error) {
    console.error("[Auth] Logout error:", error);
  }
};

// Legacy functions for fallback
const getUsersRaw = (): AppUser[] => safeJSONParse<AppUser[]>(localStorage.getItem(USERS_KEY), []).map(enrichUser);

export const seedAuth = () => {
  if (typeof window === "undefined") return;

  const existing = getUsersRaw();
  if (existing.length === 0) {
    const seeded = [defaultAdmin(), defaultDemoUser()];
    localStorage.setItem(USERS_KEY, JSON.stringify(seeded));
  }

  const users = getUsersRaw();
  const session = localStorage.getItem(SESSION_KEY);
  if (!session) {
    writeLegacyState(null);
  } else {
    const sessionUser = users.find((user) => user.id === session) || null;
    writeLegacyState(sessionUser);
  }
};

export const getUsers = (): AppUser[] => {
  if (typeof window === "undefined") return [];
  seedAuth();
  return getUsersRaw();
};

const saveUsers = (users: AppUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const updateUser = async (userId: string, updater: (user: AppUser) => AppUser) => {
  const users = getUsers();
  let updatedUser: AppUser | null = null;

  const nextUsers = users.map((user) => {
    if (user.id !== userId) return user;
    updatedUser = enrichUser(updater(user));
    return updatedUser;
  });

  saveUsers(nextUsers);

  const current = await getCurrentUser();
  if (current && updatedUser && current.id === updatedUser.id) {
    writeLegacyState(updatedUser);
  }

  emitAuthChange();
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

  let resultUser: AppUser | null = null;
  const reward = applyLevelReward(current.levelState, action);

  if (reward.awardedXp === 0) {
    return { awardedXp: 0, user: current, label: reward.label };
  }

  resultUser = await updateUser(current.id, (user) => ({
    ...user,
    levelState: reward.state,
  }));

  return {
    awardedXp: reward.awardedXp,
    user: resultUser,
    label: reward.label,
  };
};

export const getCurrentLevelInfo = async () => {
  const current = await getCurrentUser();
  return current ? getLevelTier(current.levelState.xp) : getLevelTier(0);
};
