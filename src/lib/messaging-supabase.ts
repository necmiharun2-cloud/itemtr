import { getCurrentUser, getUsers, type AppUser, type UserRole } from "@/lib/auth";
import { safeJSONParse } from "@/lib/utils";
import { supabase } from "./supabase";

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
  id: user.id,
  name: user.name,
  role: user.role,
  avatar: user.avatar,
});

// ============================================
// SUPABASE MESSAGING FUNCTIONS
// ============================================

// Get all conversations for current user
export const getConversations = async (): Promise<Conversation[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const appUser = await getCurrentUser();
    if (!appUser) return [];

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_fkey (
          id, username, name, avatar, role
        ),
        participant_2:profiles!conversations_participant_2_fkey (
          id, username, name, avatar, role
        )
      `)
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('[Messaging] Error fetching conversations:', error);
      return [];
    }

    const conversations = data || [];
    const result: Conversation[] = [];

    for (const conv of conversations) {
      const p1 = conv.participant_1;
      const p2 = conv.participant_2;
      if (!p1?.id || !p2?.id) continue;

      const otherParticipant = p1.id === user.id ? p2 : p1;
      const otherLabel = otherParticipant.username || otherParticipant.name || "Satıcı";

      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('[Messaging] Error fetching messages:', msgError);
        continue;
      }

      result.push({
        id: conv.id,
        type: "direct",
        subject: conv.listing_id ? (conv.last_message || `${otherLabel} — ilan mesajı`) : `${otherLabel} ile görüşme`,
        participants: [
          {
            id: appUser.id,
            name: appUser.name,
            role: appUser.role,
            avatar: appUser.avatar,
          },
          {
            id: otherParticipant.id,
            name: otherLabel,
            role: (otherParticipant.role as UserRole) || "user",
            avatar: otherParticipant.avatar,
          },
        ],
        messages: (messages || []).map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.sender_id === user.id ? appUser.name : otherLabel,
          senderRole: msg.sender_id === user.id ? appUser.role : (otherParticipant.role as UserRole) || "user",
          text: msg.content,
          createdAt: msg.created_at,
        })),
        unreadBy: Array.isArray(conv.unread_by) ? conv.unread_by : [],
        createdAt: conv.created_at,
        updatedAt: conv.last_message_at,
      });
    }

    return result;
  } catch (error) {
    console.error('[Messaging] Error in getConversations:', error);
    return [];
  }
};

// Get messages for a conversation
export const getMessages = async (conversationId: string): Promise<ConversationMessage[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id, name, role, avatar
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Messaging] Error fetching messages:', error);
      return [];
    }

    return (data || []).map(msg => ({
      id: msg.id,
      senderId: msg.sender_id,
      senderName: msg.sender?.name || 'Unknown',
      senderRole: msg.sender?.role || 'user',
      text: msg.content,
      createdAt: msg.created_at,
    }));
  } catch (error) {
    console.error('[Messaging] Error in getMessages:', error);
    return [];
  }
};

// Send message
export const sendMessage = async (conversationId: string, text: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Insert message
    const { error: msgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: text,
      });

    if (msgError) {
      console.error('[Messaging] Error sending message:', msgError);
      return false;
    }

    // Update conversation last message
    const { error: convError } = await supabase
      .from('conversations')
      .update({
        last_message: text,
        last_message_at: nowIso(),
      })
      .eq('id', conversationId);

    if (convError) {
      console.error('[Messaging] Error updating conversation:', convError);
    }

    return true;
  } catch (error) {
    console.error('[Messaging] Error in sendMessage:', error);
    return false;
  }
};

// Create new conversation (optionally scoped to a listing UUID)
export const createConversation = async (participantId: string, subject: string, listingId?: string | null): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    if (user.id === participantId) return null;

    let existingQuery = supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_1.eq.${user.id},participant_2.eq.${participantId}),and(participant_1.eq.${participantId},participant_2.eq.${user.id})`,
      );

    if (listingId) {
      existingQuery = existingQuery.eq("listing_id", listingId);
    } else {
      existingQuery = existingQuery.is("listing_id", null);
    }

    const { data: existingRow } = await existingQuery.maybeSingle();
    if (existingRow?.id) {
      return existingRow.id;
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        participant_1: user.id,
        participant_2: participantId,
        listing_id: listingId || null,
        last_message: subject.slice(0, 500),
        last_message_at: nowIso(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[Messaging] Error creating conversation:", error);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error("[Messaging] Error in createConversation:", error);
    return null;
  }
};

/** İlan sayfasından: satıcı profil UUID + ilan UUID ile sohbet aç ve gerekirse ilk mesajı gönder */
export const openListingConversation = async (
  sellerProfileId: string,
  listingId: string,
  listingTitle: string,
): Promise<string | null> => {
  const subject = `İlan: ${listingTitle}`.slice(0, 500);
  const convId = await createConversation(sellerProfileId, subject, listingId);
  if (!convId) return null;

  const messages = await getMessages(convId);
  if (messages.length === 0) {
    const ok = await sendMessage(convId, `Merhaba, "${listingTitle}" ilanı hakkında yazıyorum.`);
    if (!ok) return convId;
  }
  return convId;
};

// Mark messages as read
export const markAsRead = async (conversationId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    if (error) {
      console.error('[Messaging] Error marking as read:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Messaging] Error in markAsRead:', error);
    return false;
  }
};

// ============================================
// LEGACY FUNCTIONS (Fallback)
// ============================================

const getConversationsLegacy = (): Conversation[] => {
  if (typeof window === "undefined") return [];
  return safeJSONParse<Conversation[]>(localStorage.getItem(CONVERSATIONS_KEY), []);
};

const saveConversations = (conversations: Conversation[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  window.dispatchEvent(new Event(MESSAGING_EVENT));
  window.dispatchEvent(new Event("storage"));
};

const defaultConversationsForUser = (user: AppUser): Conversation[] => {
  const viewer = createUserParticipant(user);

  return [
    {
      id: `direct-${user.id.toLowerCase()}-ilkanshop`,
      type: "direct",
      subject: "IlkanShop ile görüşme",
      participants: [viewer, defaultSellerParticipants[0]],
      messages: [
        { id: "m-1", senderId: user.id, senderName: user.name, senderRole: user.role, text: "Merhaba, CS2 hesap için yazıyorum.", createdAt: "2026-04-02T10:30:00" },
        { id: "m-2", senderId: "IlkanShop", senderName: "IlkanShop", senderRole: "seller", text: "Merhaba, tabii yardımcı olayım.", createdAt: "2026-04-02T10:31:00" },
        { id: "m-3", senderId: user.id, senderName: user.name, senderRole: user.role, text: "Ödemeyi yaptım, ne zaman teslim edilir?", createdAt: "2026-04-02T10:32:00" },
        { id: "m-4", senderId: "IlkanShop", senderName: "IlkanShop", senderRole: "seller", text: "Hesap bilgileri mail adresinize gönderildi.", createdAt: "2026-04-02T10:35:00" },
      ],
      unreadBy: [user.id],
      createdAt: "2026-04-02T10:30:00",
      updatedAt: "2026-04-02T10:35:00",
    },
    {
      id: `direct-${user.id.toLowerCase()}-marcusstore`,
      type: "direct",
      subject: "MarcusStore ile görüşme",
      participants: [viewer, defaultSellerParticipants[1]],
      messages: [
        { id: "m-5", senderId: user.id, senderName: user.name, senderRole: user.role, text: "Valorant hesap stoğu var mı?", createdAt: "2026-04-01T09:00:00" },
        { id: "m-6", senderId: "MarcusStore", senderName: "MarcusStore", senderRole: "seller", text: "Evet, stoğumuz mevcut.", createdAt: "2026-04-01T09:05:00" },
      ],
      unreadBy: [],
      createdAt: "2026-04-01T09:00:00",
      updatedAt: "2026-04-01T09:05:00",
    },
  ];
};

export const seedMessaging = () => {
  if (typeof window === "undefined") return;
  const existing = getConversationsLegacy();
  const user = getCurrentUser();
  if (user && existing.length === 0) {
    saveConversations(defaultConversationsForUser(user));
  }
};

export const addMessage = (conversationId: string, message: ConversationMessage) => {
  const conversations = getConversationsLegacy();
  const conv = conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.messages.push(message);
    conv.updatedAt = message.createdAt;
    if (!conv.unreadBy.includes(message.senderId)) {
      conv.unreadBy.push(message.senderId);
    }
    saveConversations(conversations);
  }
};

export const createSupportTicket = (subject: string, category: string, message: string) => {
  const conversations = getConversationsLegacy();
  const user = getCurrentUser();
  if (!user) return;

  const ticket: Conversation = {
    id: `support-${Date.now()}`,
    type: "support",
    subject,
    category,
    status: "Beklemede",
    ticketId: `TKT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
    participants: [createUserParticipant(user), supportParticipant],
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: user.id,
        senderName: user.name,
        senderRole: user.role,
        text: message,
        createdAt: nowIso(),
      },
    ],
    unreadBy: ["support"],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  saveConversations([ticket, ...conversations]);
};

export const getSupportTickets = (): SupportTicketView[] => {
  const conversations = getConversationsLegacy();
  const user = getCurrentUser();
  if (!user) return [];

  return conversations
    .filter((c) => c.type === "support" && c.participants.some((p) => p.id === user.id))
    .map((c) => ({
      id: c.ticketId || c.id,
      conversationId: c.id,
      user: user.name,
      subject: c.subject,
      category: c.category || "Genel",
      status: c.status || "Beklemede",
      date: formatDate(c.createdAt),
    }));
};

export const markConversationAsRead = (conversationId: string) => {
  const conversations = getConversationsLegacy();
  const user = getCurrentUser();
  if (!user) return;

  const conv = conversations.find((c) => c.id === conversationId);
  if (conv && conv.unreadBy.includes(user.id)) {
    conv.unreadBy = conv.unreadBy.filter((id) => id !== user.id);
    saveConversations(conversations);
  }
};

export const deleteConversation = (conversationId: string) => {
  const conversations = getConversationsLegacy();
  saveConversations(conversations.filter((c) => c.id !== conversationId));
};
