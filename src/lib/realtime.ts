import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { Conversation, ConversationMessage } from './messaging';

// Realtime messaging hook
export const useRealtimeMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    // Fetch initial messages
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data.map(m => ({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name || 'Unknown',
          senderRole: m.sender_role || 'user',
          text: m.content,
          createdAt: m.created_at,
        })));
      }
      setIsLoading(false);
    };

    fetchMessages();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages((prev) => [...prev, {
            id: newMessage.id,
            senderId: newMessage.sender_id,
            senderName: newMessage.sender_name || 'Unknown',
            senderRole: newMessage.sender_role || 'user',
            text: newMessage.content,
            createdAt: newMessage.created_at,
          }]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId]);

  return { messages, isLoading };
};

// Realtime conversations hook
export const useRealtimeConversations = (userId: string | null) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setConversations([]);
      setUnreadCount(0);
      return;
    }

    // Fetch initial conversations
    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`*, participant1:participant_1(*), participant2:participant_2(*)`)
        .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
        .order('last_message_at', { ascending: false });

      if (!error && data) {
        const formattedConversations: Conversation[] = await Promise.all(
          data.map(async (conv: any) => {
            // Get messages for this conversation
            const { data: messages } = await supabase
              .from('messages')
              .select('*')
              .eq('conversation_id', conv.id)
              .order('created_at', { ascending: true });

            return {
              id: conv.id,
              type: 'direct',
              subject: conv.listing_id ? `İlan: ${conv.listing_id}` : 'Mesajlaşma',
              participants: [
                { id: conv.participant_1, name: conv.participant1?.name || 'Unknown', role: conv.participant1?.role || 'user', avatar: conv.participant1?.avatar },
                { id: conv.participant_2, name: conv.participant2?.name || 'Unknown', role: conv.participant2?.role || 'user', avatar: conv.participant2?.avatar },
              ],
              messages: (messages || []).map((m: any) => ({
                id: m.id,
                senderId: m.sender_id,
                senderName: m.sender_id === conv.participant_1 ? conv.participant1?.name : conv.participant2?.name,
                senderRole: m.sender_id === conv.participant_1 ? conv.participant1?.role : conv.participant2?.role,
                text: m.content,
                createdAt: m.created_at,
              })),
              unreadBy: conv.unread_by || [],
              createdAt: conv.created_at,
              updatedAt: conv.last_message_at || conv.created_at,
            };
          })
        );
        setConversations(formattedConversations);

        // Count unread
        const unread = formattedConversations.filter(c => c.unreadBy.includes(userId)).length;
        setUnreadCount(unread);
      }
    };

    fetchConversations();

    // Subscribe to conversation changes
    const subscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_1=eq.${userId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `participant_2=eq.${userId}`,
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { conversations, unreadCount };
};

// Realtime notifications hook
export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // Subscribe to realtime changes
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
          const newNotification = payload.new as any;
          setNotifications((prev) => [newNotification, ...prev]);
          if (!newNotification.is_read) {
            setUnreadCount((prev) => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          // Recalculate unread count
          setUnreadCount((prev) => (updated.is_read ? Math.max(0, prev - 1) : prev));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { notifications, unreadCount };
};
