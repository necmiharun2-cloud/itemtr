import { getCurrentUser, type AppUser, type UserRole } from "@/lib/auth";
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

const nowIso = () => new Date().toISOString();

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
