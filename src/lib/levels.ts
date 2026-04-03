export type LevelAction =
  | "register"
  | "email_verified"
  | "phone_verified"
  | "identity_verified"
  | "first_avatar_upload"
  | "first_deposit"
  | "deposit"
  | "first_listing"
  | "listing_sale"
  | "purchase"
  | "review"
  | "about_completed"
  | "sms_security"
  | "bank_account_added"
  | "vitrin_purchase"
  | "featured_listing_purchase";

export type LevelRewardDefinition = {
  label: string;
  xp: number;
  repeatable?: boolean;
};

export type LevelHistoryItem = {
  id: string;
  action: LevelAction;
  label: string;
  xp: number;
  createdAt: string;
};

export type LevelState = {
  xp: number;
  counts: Partial<Record<LevelAction, number>>;
  history: LevelHistoryItem[];
};

export const LEVEL_REWARDS: Record<LevelAction, LevelRewardDefinition> = {
  register: { label: "Siteye kayıt", xp: 30 },
  email_verified: { label: "E-posta doğrulama", xp: 45 },
  phone_verified: { label: "Telefon doğrulama", xp: 45 },
  identity_verified: { label: "Kimlik doğrulama", xp: 45 },
  first_avatar_upload: { label: "İlk profil resmi", xp: 45 },
  first_deposit: { label: "İlk bakiye yükleme", xp: 90 },
  deposit: { label: "Bakiye yükleme", xp: 10, repeatable: true },
  first_listing: { label: "İlk ilan oluşturma", xp: 15 },
  listing_sale: { label: "İlan satışı", xp: 15, repeatable: true },
  purchase: { label: "Satın alım", xp: 35, repeatable: true },
  review: { label: "Değerlendirme", xp: 20, repeatable: true },
  about_completed: { label: "Hakkımda alanı", xp: 45 },
  sms_security: { label: "SMS güvenliği", xp: 20 },
  bank_account_added: { label: "Banka hesabı ekleme", xp: 15 },
  vitrin_purchase: { label: "Vitrin ilanı", xp: 30, repeatable: true },
  featured_listing_purchase: { label: "Öne çıkarılan ilan", xp: 20, repeatable: true },
};

export type LevelTier = {
  level: number;
  title: string;
  badge: string;
  color: string;
  bgGradient: string;
  textColor: string;
  borderColor: string;
  minXp: number;
  description: string;
};

export const LEVEL_TIERS: LevelTier[] = [
  { 
    level: 1, 
    title: "Çaylak", 
    badge: "🌱",
    color: "#6B7280",
    bgGradient: "from-gray-500/20 to-gray-600/10",
    textColor: "text-gray-400",
    borderColor: "border-gray-500/40",
    minXp: 0,
    description: "Yeni üye - sistemi tanıyor"
  },
  { 
    level: 2, 
    title: "Bronz", 
    badge: "🥉",
    color: "#CD7F32",
    bgGradient: "from-orange-600/20 to-amber-700/10",
    textColor: "text-orange-400",
    borderColor: "border-orange-500/40",
    minXp: 75,
    description: "Bronz satıcı - ilk işlemlerini tamamladı"
  },
  { 
    level: 3, 
    title: "Gümüş", 
    badge: "🥈",
    color: "#C0C0C0",
    bgGradient: "from-slate-400/20 to-gray-500/10",
    textColor: "text-slate-300",
    borderColor: "border-slate-400/40",
    minXp: 180,
    description: "Gümüş satıcı - deneyim kazandı"
  },
  { 
    level: 4, 
    title: "Altın", 
    badge: "🥇",
    color: "#FFD700",
    bgGradient: "from-yellow-500/20 to-amber-600/10",
    textColor: "text-yellow-400",
    borderColor: "border-yellow-500/40",
    minXp: 350,
    description: "Altın satıcı - güvenilir üye"
  },
  { 
    level: 5, 
    title: "Elmas", 
    badge: "💎",
    color: "#00CED1",
    bgGradient: "from-cyan-500/20 to-teal-600/10",
    textColor: "text-cyan-400",
    borderColor: "border-cyan-500/40",
    minXp: 600,
    description: "Elmas satıcı - profesyonel satıcı"
  },
  { 
    level: 6, 
    title: "Usta", 
    badge: "👑",
    color: "#9333EA",
    bgGradient: "from-purple-500/20 to-violet-600/10",
    textColor: "text-purple-400",
    borderColor: "border-purple-500/40",
    minXp: 950,
    description: "Usta satıcı - platformun en iyileri"
  },
  { 
    level: 7, 
    title: "Efsane", 
    badge: "🏆",
    color: "#FACC15",
    bgGradient: "from-amber-400/20 to-yellow-500/10",
    textColor: "text-amber-400",
    borderColor: "border-amber-400/40",
    minXp: 1400,
    description: "Efsane satıcı - en üst seviye"
  },
];

export const createInitialLevelState = (xp = 0): LevelState => ({
  xp,
  counts: {},
  history: [],
});

export const applyLevelReward = (state: LevelState, action: LevelAction) => {
  const definition = LEVEL_REWARDS[action];
  const currentCount = state.counts[action] || 0;
  const shouldAward = definition.repeatable || currentCount === 0;

  if (!shouldAward) {
    return {
      state,
      awardedXp: 0,
      label: definition.label,
    };
  }

  const nextCount = currentCount + 1;
  const nextState: LevelState = {
    xp: state.xp + definition.xp,
    counts: {
      ...state.counts,
      [action]: nextCount,
    },
    history: [
      {
        id: `${action}-${Date.now()}-${nextCount}`,
        action,
        label: definition.label,
        xp: definition.xp,
        createdAt: new Date().toISOString(),
      },
      ...state.history,
    ].slice(0, 25),
  };

  return {
    state: nextState,
    awardedXp: definition.xp,
    label: definition.label,
  };
};

export const getLevelTier = (xp: number) => {
  let active = LEVEL_TIERS[0];

  for (const tier of LEVEL_TIERS) {
    if (xp >= tier.minXp) {
      active = tier;
    }
  }

  const nextTier = LEVEL_TIERS.find((tier) => tier.minXp > active.minXp);
  const progress = nextTier
    ? Math.min(100, Math.round(((xp - active.minXp) / Math.max(nextTier.minXp - active.minXp, 1)) * 100))
    : 100;

  return {
    ...active,
    currentXp: xp,
    nextLevelXp: nextTier?.minXp ?? null,
    remainingXp: nextTier ? Math.max(nextTier.minXp - xp, 0) : 0,
    progress,
  };
};
