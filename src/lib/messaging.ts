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

const currentViewerId = async () => {
  const currentUser = await getCurrentUser();
  return currentUser?.role === "admin" ? currentUser.username : currentUser?.username || "";
};

export const getVisibleConversations = async () => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return [];

  const viewerId = currentUser.username;
  const conversations = getConversations();

  if (currentUser.role === "admin") {
    return conversations.filter((conversation) => conversation.type === "support");
  }

  return conversations.filter((conversation) => conversation.participants.some((participant) => participant.id === viewerId));
};

export const getConversationCounterpart = (conversation: Conversation, viewerId: string) => {
  return (
    conversation.participants.find((participant) => participant.id !== viewerId) ||
    conversation.participants[0]
  );
};

export const markConversationRead = async (conversationId: string, viewerId?: string) => {
  const id = viewerId || await currentViewerId();
  if (!id) return;
  const next = getConversations().map((conversation) =>
    conversation.id === conversationId
      ? { ...conversation, unreadBy: (conversation.unreadBy || []).filter((uid) => uid !== id) }
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

export const getConversationSummary = (conversation: Conversation, viewerId: string) => {
  const counterpart = getConversationCounterpart(conversation, viewerId);
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  return {
    counterpart,
    title: conversation.type === "support" ? `${conversation.subject}` : counterpart?.name || conversation.subject,
    subtitle: conversation.type === "support" ? `${counterpart?.name || "Destek"} • ${conversation.category || "Genel"}` : conversation.subject,
    lastMessage: lastMessage?.text || "Henüz mesaj yok.",
    time: lastMessage ? formatTime(lastMessage.createdAt) : formatTime(conversation.updatedAt),
    unread: conversation.unreadBy.includes(viewerId) ? 1 : 0,
  };
};

// ============================================
// SUPABASE MESSAGING FUNCTIONS
// ============================================

// Convert Supabase conversation to Conversation
const convertConversation = (conv: any, messages: any[], profile1: any, profile2: any): Conversation => {
  const participants: ConversationParticipant[] = [
    { id: conv.participant_1, name: profile1?.name || 'Unknown', role: profile1?.role || 'user', avatar: profile1?.avatar },
    { id: conv.participant_2, name: profile2?.name || 'Unknown', role: profile2?.role || 'user', avatar: profile2?.avatar },
  ];

  return {
    id: conv.id,
    type: 'direct',
    subject: conv.listing_id ? `İlan: ${conv.listing_id}` : 'Mesajlaşma',
    participants,
    messages: messages.map(m => ({
      id: m.id,
      senderId: m.sender_id,
      senderName: m.sender_id === conv.participant_1 ? profile1?.name : profile2?.name,
      senderRole: m.sender_id === conv.participant_1 ? profile1?.role : profile2?.role,
      text: m.content,
      createdAt: m.created_at,
    })),
    unreadBy: conv.unread_by || [],
    createdAt: conv.created_at,
    updatedAt: conv.last_message_at || conv.created_at,
  };
};

// Get user's conversations from Supabase
export const getConversationsFromSupabase = async (userId: string): Promise<Conversation[]> => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`*, participant1:participant_1(*), participant2:participant_2(*)`)
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('[Messaging] Error fetching conversations:', error);
      return [];
    }

    // Fetch messages for each conversation
    const result: Conversation[] = [];
    for (const conv of conversations || []) {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: true });

      result.push(convertConversation(conv, messages || [], conv.participant1, conv.participant2));
    }

    return result;
  } catch (error) {
    console.error('[Messaging] Error:', error);
    return [];
  }
};

// Create conversation in Supabase
export const createConversationInSupabase = async (participant1Id: string, participant2Id: string, listingId?: string) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1: participant1Id,
        participant_2: participant2Id,
        listing_id: listingId,
        unread_by: [],
      })
      .select()
      .single();

    if (error) {
      console.error('[Messaging] Error creating conversation:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true, conversation: data };
  } catch (error) {
    console.error('[Messaging] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Send message in Supabase
export const sendMessageInSupabase = async (conversationId: string, senderId: string, content: string) => {
  try {
    // Insert message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('[Messaging] Error sending message:', error);
      return { ok: false, error: error.message };
    }

    // Update conversation last_message
    await supabase
      .from('conversations')
      .update({
        last_message: content,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversationId);

    return { ok: true, message };
  } catch (error) {
    console.error('[Messaging] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Mark messages as read in Supabase
export const markMessagesAsReadInSupabase = async (conversationId: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('sender_id', userId)
      .eq('is_read', false);

    if (error) {
      console.error('[Messaging] Error marking messages as read:', error);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    console.error('[Messaging] Error:', error);
    return { ok: false, error: 'Bir hata oluştu' };
  }
};

// Get unread message count for user
export const getUnreadMessageCountFromSupabase = async (userId: string): Promise<number> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`*, conversations!inner(participant_1, participant_2)`)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (error) {
      console.error('[Messaging] Error fetching unread count:', error);
      return 0;
    }

    // Filter messages where user is a participant
    const count = messages?.filter(m => 
      m.conversations?.participant_1 === userId || 
      m.conversations?.participant_2 === userId
    ).length || 0;

    return count;
  } catch (error) {
    console.error('[Messaging] Error:', error);
    return 0;
  }
};
