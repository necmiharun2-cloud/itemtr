import { getCurrentUser, getUsers, type AppUser, type UserRole } from "@/lib/auth";
import { safeJSONParse } from "@/lib/utils";
import {
  getConversations as fetchSupabaseConversations,
  sendMessage as sendSupabaseDM,
  openListingConversation,
  markAsRead as markSupabaseConversationRead,
} from "./messaging-supabase";

export type ConversationRole = UserRole | "seller" | "support";

export type ConversationParticipant = {
  id: string;
  name: string;
  role: ConversationRole;
  avatar?: string;
};

export type ConversationMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: ConversationRole;
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  type: "direct" | "support";
  subject: string;
  category?: string;
  status?: "Beklemede" | "Cevaplandı";
  ticketId?: string;
  participants: ConversationParticipant[];
  messages: ConversationMessage[];
  unreadBy: string[];
  createdAt: string;
  updatedAt: string;
};

export type SupportTicketView = {
  id: string;
  conversationId: string;
  user: string;
  subject: string;
  category: string;
  status: "Beklemede" | "Cevaplandı";
  date: string;
};

const CONVERSATIONS_KEY = "itemtr_conversations";
export const MESSAGING_EVENT = "itemtr-messaging-updated";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isSupabaseConversationId = (id: string) => UUID_RE.test(String(id));

export const isSupabaseProfileId = (id: string | null | undefined): id is string => Boolean(id && UUID_RE.test(String(id)));

export const viewerIdentityIds = (user: AppUser | null | undefined): string[] => {
  if (!user) return [];
  return [...new Set([user.username, user.id].filter(Boolean))] as string[];
};

const nowIso = () => new Date().toISOString();
const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "short", year: "numeric" });

const sellerAvatar = (name: string) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

const supportParticipant: ConversationParticipant = {
  id: "support",
  name: "Destek Ekibi",
  role: "support",
  avatar: sellerAvatar("Destek"),
};

const defaultSellerParticipants: ConversationParticipant[] = [
  { id: "IlkanShop", name: "IlkanShop", role: "seller", avatar: sellerAvatar("Ilkan") },
  { id: "MarcusStore", name: "MarcusStore", role: "seller", avatar: sellerAvatar("Marcus") },
  { id: "RZShop", name: "RZShop", role: "seller", avatar: sellerAvatar("RZ") },
];

const createUserParticipant = (user: AppUser): ConversationParticipant => ({
  id: user.username,
  name: user.name,
  role: user.role,
  avatar: user.avatar,
});

const defaultConversationsForUser = (user: AppUser): Conversation[] => {
  const viewer = createUserParticipant(user);

  return [
    {
      id: `direct-${user.username.toLowerCase()}-ilkanshop`,
      type: "direct",
      subject: "IlkanShop ile görüşme",
      participants: [viewer, defaultSellerParticipants[0]],
      messages: [
        { id: "m-1", senderId: user.username, senderName: user.name, senderRole: user.role, text: "Merhaba, CS2 hesap için yazıyorum.", createdAt: "2026-04-02T10:30:00" },
        { id: "m-2", senderId: "IlkanShop", senderName: "IlkanShop", senderRole: "seller", text: "Merhaba, tabii yardımcı olayım.", createdAt: "2026-04-02T10:31:00" },
        { id: "m-3", senderId: user.username, senderName: user.name, senderRole: user.role, text: "Ödemeyi yaptım, ne zaman teslim edilir?", createdAt: "2026-04-02T10:32:00" },
        { id: "m-4", senderId: "IlkanShop", senderName: "IlkanShop", senderRole: "seller", text: "Hesap bilgileri mail adresinize gönderildi.", createdAt: "2026-04-02T10:35:00" },
      ],
      unreadBy: [user.username],
      createdAt: "2026-04-02T10:30:00",
      updatedAt: "2026-04-02T10:35:00",
    },
    {
      id: `direct-${user.username.toLowerCase()}-marcusstore`,
      type: "direct",
      subject: "MarcusStore ile görüşme",
      participants: [viewer, defaultSellerParticipants[1]],
      messages: [
        { id: "m-5", senderId: user.username, senderName: user.name, senderRole: user.role, text: "Valorant hesap stoğu var mı?", createdAt: "2026-04-01T09:00:00" },
        { id: "m-6", senderId: "MarcusStore", senderName: "MarcusStore", senderRole: "seller", text: "Evet var, shop sayfamıza bakabilirsiniz.", createdAt: "2026-04-01T09:05:00" },
      ],
      unreadBy: [],
      createdAt: "2026-04-01T09:00:00",
      updatedAt: "2026-04-01T09:05:00",
    },
    {
      id: `support-${user.username.toLowerCase()}-welcome`,
      type: "support",
      subject: "Hesabınıza hoş geldiniz",
      category: "Genel",
      status: "Cevaplandı",
      ticketId: `T-${user.username.slice(0, 3).toUpperCase()}1001`,
      participants: [viewer, supportParticipant],
      messages: [
        { id: "m-7", senderId: "support", senderName: "Destek Ekibi", senderRole: "support", text: "Merhaba, destek ekibine hoş geldiniz. Sorularınızı buradan bize iletebilirsiniz.", createdAt: "2026-04-02T08:00:00" },
      ],
      unreadBy: [],
      createdAt: "2026-04-02T08:00:00",
      updatedAt: "2026-04-02T08:00:00",
    },
  ];
};

const emitMessagingChange = () => {
  window.dispatchEvent(new Event(MESSAGING_EVENT));
};

const saveConversations = (items: Conversation[]) => {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(items));
  emitMessagingChange();
};

const getConversationsRaw = (): Conversation[] => safeJSONParse<Conversation[]>(localStorage.getItem(CONVERSATIONS_KEY), []);

export const seedMessaging = () => {
  if (typeof window === "undefined") return;

  const current = getConversationsRaw();
  const users = getUsers();

  if (current.length === 0) {
    const seeded = users.flatMap((user) => (user.role === "user" ? defaultConversationsForUser(user) : []));
    saveConversations(seeded);
    return;
  }

  const next = [...current];
  let changed = false;

  users
    .filter((user) => user.role === "user")
    .forEach((user) => {
      const hasConversation = next.some((conversation) => conversation.participants.some((participant) => participant.id === user.username));
      if (!hasConversation) {
        next.push(...defaultConversationsForUser(user));
        changed = true;
      }
    });

  if (changed) saveConversations(next);
};

export const getConversations = () => {
  seedMessaging();
  return getConversationsRaw().sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
};

export const getVisibleConversations = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const viewerIds = viewerIdentityIds(currentUser);
  const localAll = getConversations();

  if (currentUser.role === "admin") {
    return localAll.filter((conversation) => conversation.type === "support");
  }

  const localFiltered = localAll.filter((conversation) =>
    conversation.participants.some((participant) => viewerIds.includes(participant.id)),
  );

  let remote: Conversation[] = [];
  if (isSupabaseProfileId(currentUser.id)) {
    try {
      remote = await fetchSupabaseConversations();
    } catch (e) {
      console.warn("[Messaging] Supabase sohbetler yüklenemedi:", e);
    }
  }

  const seen = new Set<string>();
  const merged: Conversation[] = [];
  for (const c of [...remote, ...localFiltered]) {
    if (seen.has(c.id)) continue;
    seen.add(c.id);
    merged.push(c);
  }

  return merged.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
};

export const getConversationCounterpart = (conversation: Conversation, viewerIds: string[]) => {
  return (
    conversation.participants.find((participant) => !viewerIds.includes(participant.id)) ||
    conversation.participants[0]
  );
};

export const markConversationRead = async (conversationId: string, viewerIds?: string[]) => {
  const user = await getCurrentUser();
  const ids = viewerIds?.length ? viewerIds : viewerIdentityIds(user);
  if (!ids.length) return;

  if (isSupabaseConversationId(conversationId)) {
    await markSupabaseConversationRead(conversationId);
    emitMessagingChange();
    return;
  }

  const next = getConversations().map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, unreadBy: (conversation.unreadBy || []).filter((uid) => !ids.includes(uid)) }
      : conversation,
  );
  saveConversations(next);
};

export const sendConversationMessage = (conversationId: string, sender: ConversationParticipant, text: string) => {
  const messageText = text.trim();
  if (!messageText) return null;

  const next = getConversations().map((conversation) => {
    if (conversation.id !== conversationId) return conversation;

    const createdAt = nowIso();
    const recipients = conversation.participants
      .filter((participant) => participant.id !== sender.id)
      .map((participant) => participant.id);

    return {
      ...conversation,
      status: conversation.type === "support" ? (sender.role === "admin" || sender.role === "support" ? "Cevaplandı" : "Beklemede") : conversation.status,
      unreadBy: Array.from(new Set([...(conversation.unreadBy || []), ...recipients])),
      updatedAt: createdAt,
      messages: [
        ...conversation.messages,
        {
          id: `msg-${Date.now()}`,
          senderId: sender.id,
          senderName: sender.name,
          senderRole: sender.role,
          text: messageText,
          createdAt,
        },
      ],
    };
  });

  saveConversations(next);
  return next.find((conversation) => conversation.id === conversationId) || null;
};

export const createSupportConversation = ({ user, subject, category, message }: { user: AppUser; subject: string; category: string; message: string }) => {
  const createdAt = nowIso();
  const ticketId = `T-${Math.floor(Math.random() * 9000) + 1000}`;
  const conversation: Conversation = {
    id: `support-${user.username.toLowerCase()}-${Date.now()}`,
    type: "support",
    subject: subject.trim(),
    category: category.trim() || "Genel",
    status: "Beklemede",
    ticketId,
    participants: [createUserParticipant(user), supportParticipant],
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: user.username,
        senderName: user.name,
        senderRole: user.role,
        text: message.trim(),
        createdAt,
      },
    ],
    unreadBy: ["admin", "support"],
    createdAt,
    updatedAt: createdAt,
  };

  saveConversations([conversation, ...getConversations()]);
  return conversation;
};

export const getSupportTicketsForCurrentUser = async (): Promise<SupportTicketView[]> => {
  const current = await getCurrentUser();
  if (!current) return [];

  return getConversations()
    .filter((conversation) => conversation.type === "support" && conversation.participants.some((participant) => participant.id === current.username))
    .map((conversation) => ({
      id: conversation.ticketId || conversation.id,
      conversationId: conversation.id,
      user: current.username,
      subject: conversation.subject,
      category: conversation.category || "Genel",
      status: conversation.status || "Beklemede",
      date: formatDate(conversation.updatedAt),
    }));
};

export const getAllSupportTickets = (): SupportTicketView[] => {
  return getConversations()
    .filter((conversation) => conversation.type === "support")
    .map((conversation) => {
      const requester = conversation.participants.find((participant) => participant.role === "user") || conversation.participants[0];
      return {
        id: conversation.ticketId || conversation.id,
        conversationId: conversation.id,
        user: requester?.id || "Bilinmiyor",
        subject: conversation.subject,
        category: conversation.category || "Genel",
        status: conversation.status || "Beklemede",
        date: formatDate(conversation.updatedAt),
      };
    });
};

export const getConversationSummary = (conversation: Conversation, viewerIds: string[]) => {
  const counterpart = getConversationCounterpart(conversation, viewerIds);
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const unread = (conversation.unreadBy || []).some((uid) => viewerIds.includes(uid)) ? 1 : 0;
  return {
    counterpart,
    title: conversation.type === "support" ? `${conversation.subject}` : counterpart?.name || conversation.subject,
    subtitle: conversation.type === "support" ? `${counterpart?.name || "Destek"} • ${conversation.category || "Genel"}` : conversation.subject,
    lastMessage: lastMessage?.text || "Henüz mesaj yok.",
    time: lastMessage ? formatTime(lastMessage.createdAt) : formatTime(conversation.updatedAt),
    unread,
  };
};

const listingConversationSlug = (buyer: AppUser, sellerUsername: string, listingId: string) =>
  `direct-${buyer.username}-${sellerUsername}-${listingId}`.replace(/[^a-zA-Z0-9-]/g, "-").slice(0, 120);

export const createOrOpenLocalListingConversation = (
  buyer: AppUser,
  listingId: string,
  listingTitle: string,
  sellerUsername: string,
  sellerAvatarUrl?: string,
): string => {
  seedMessaging();
  const convId = listingConversationSlug(buyer, sellerUsername, listingId);
  const existing = getConversations().find((c) => c.id === convId);
  if (existing) return convId;

  const sellerParticipant: ConversationParticipant = {
    id: sellerUsername,
    name: sellerUsername,
    role: "seller",
    avatar: sellerAvatarUrl || sellerAvatar(sellerUsername),
  };
  const createdAt = nowIso();
  const intro = `Merhaba, "${listingTitle}" ilanı hakkında yazıyorum.`;
  const conversation: Conversation = {
    id: convId,
    type: "direct",
    subject: `İlan: ${listingTitle}`.slice(0, 200),
    participants: [createUserParticipant(buyer), sellerParticipant],
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: buyer.username,
        senderName: buyer.name,
        senderRole: buyer.role,
        text: intro,
        createdAt,
      },
    ],
    unreadBy: [sellerUsername],
    createdAt,
    updatedAt: createdAt,
  };
  saveConversations([conversation, ...getConversations()]);
  return convId;
};

export const startChatFromListing = async (opts: {
  listingId: string;
  listingTitle: string;
  sellerUsername: string;
  sellerProfileId?: string | null;
  sellerAvatarUrl?: string;
}): Promise<{ ok: boolean; conversationId?: string; reason?: "login" | "self" | "fail" }> => {
  const user = await getCurrentUser();
  if (!user) return { ok: false, reason: "login" };
  if (user.username === opts.sellerUsername) return { ok: false, reason: "self" };
  if (opts.sellerProfileId && user.id === opts.sellerProfileId) return { ok: false, reason: "self" };

  const canSupabase =
    isSupabaseProfileId(user.id) &&
    isSupabaseProfileId(opts.sellerProfileId) &&
    isSupabaseProfileId(opts.listingId);

  if (canSupabase) {
    const convId = await openListingConversation(opts.sellerProfileId!, opts.listingId, opts.listingTitle);
    if (convId) {
      emitMessagingChange();
      return { ok: true, conversationId: convId };
    }
    return { ok: false, reason: "fail" };
  }

  const convId = createOrOpenLocalListingConversation(
    user,
    opts.listingId,
    opts.listingTitle,
    opts.sellerUsername,
    opts.sellerAvatarUrl,
  );
  return { ok: true, conversationId: convId };
};

export const sendChatMessage = async (conversationId: string, localSender: ConversationParticipant, text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (isSupabaseConversationId(conversationId)) {
    const ok = await sendSupabaseDM(conversationId, trimmed);
    emitMessagingChange();
    return ok;
  }
  sendConversationMessage(conversationId, localSender, trimmed);
  return true;
};
