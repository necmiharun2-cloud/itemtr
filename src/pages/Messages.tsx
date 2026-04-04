import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Send, ShieldCheck, CheckCheck, Loader2 } from "lucide-react";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import NavMenu from "@/components/NavMenu";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { getConversationCounterpart, getConversationSummary, getVisibleConversations, markConversationRead, MESSAGING_EVENT, sendConversationMessage, type Conversation } from "@/lib/messaging";

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const syncConversations = useCallback(async () => {
    setLoading(true);
    const user = await getCurrentUser();
    const next = await getVisibleConversations();
    setCurrentUser(user);
    setConversations(next);

    const requested = searchParams.get("chat");
    const matched = next.find((conversation) => conversation.id === requested || conversation.ticketId === requested);
    setSelectedConversationId((prev) => {
      if (matched) return matched.id;
      if (prev && next.some((conversation) => conversation.id === prev)) return prev;
      return next[0]?.id || "";
    });
    setLoading(false);
  }, [searchParams]);

  useEffect(() => {
    void syncConversations();
    window.addEventListener(MESSAGING_EVENT, syncConversations);
    return () => window.removeEventListener(MESSAGING_EVENT, syncConversations);
  }, [syncConversations]);

  const viewerId = currentUser?.username || "";

  const filteredConversations = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return conversations;

    return conversations.filter((conversation) => {
      const summary = getConversationSummary(conversation, viewerId);
      return [summary.title, summary.subtitle, summary.lastMessage].some((value) => value.toLowerCase().includes(needle));
    });
  }, [conversations, search, viewerId]);

  const selectedConversation = filteredConversations.find((conversation) => conversation.id === selectedConversationId)
    || conversations.find((conversation) => conversation.id === selectedConversationId)
    || filteredConversations[0]
    || conversations[0]
    || null;

  const summary = selectedConversation ? getConversationSummary(selectedConversation, viewerId) : null;
  const counterpart = selectedConversation ? getConversationCounterpart(selectedConversation, viewerId) : null;

  useEffect(() => {
    if (!selectedConversation || !viewerId) return;
    markConversationRead(selectedConversation.id, viewerId);
  }, [selectedConversationId, selectedConversation, viewerId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedConversationId, conversations]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !currentUser || !newMessage.trim()) return;

    sendConversationMessage(
      selectedConversation.id,
      {
        id: currentUser.username,
        name: currentUser.name,
        role: currentUser.role,
        avatar: currentUser.avatar,
      },
      newMessage,
    );
    setNewMessage("");
    await syncConversations();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />
      <Header />
      <NavMenu />

      <main className="flex-1 overflow-hidden container py-4 flex gap-4">
        <div className="w-full md:w-80 flex flex-col bg-card rounded-3xl border border-border overflow-hidden shrink-0">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-foreground">Mesajlar</h2>
              {currentUser?.role === "admin" && (
                <div className="inline-flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-3.5 w-3.5" /> Admin
                </div>
              )}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Sohbetlerde ara..." className="pl-10 rounded-xl h-11" />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loading ? (
                <div className="p-6 text-sm text-muted-foreground flex items-center"><Loader2 className="h-4 w-4 animate-spin mr-2" />Sohbetler yükleniyor...</div>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => {
                  const item = getConversationSummary(conversation, viewerId);
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedConversationId(conversation.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 rounded-2xl transition-all text-left",
                        selectedConversation?.id === conversation.id ? "bg-primary/10 border border-primary/20" : "hover:bg-secondary border border-transparent",
                      )}
                    >
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={item.counterpart?.avatar} />
                        <AvatarFallback>{(item.counterpart?.name || item.title).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium text-foreground truncate">{item.title}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{item.lastMessage}</p>
                      </div>
                      {item.unread > 0 && <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">{item.unread}</span>}
                    </button>
                  );
                })
              ) : (
                <div className="p-6 text-sm text-muted-foreground">Henüz görüntülenecek sohbet yok.</div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="hidden md:flex flex-1 bg-card rounded-3xl border border-border overflow-hidden">
          {selectedConversation ? (
            <div className="flex-1 flex flex-col min-w-0">
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 border border-border">
                    <AvatarImage src={counterpart?.avatar} />
                    <AvatarFallback>{(counterpart?.name || summary?.title || "S").charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{summary?.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedConversation.type === "support" ? `${selectedConversation.status || "Beklemede"} · ${selectedConversation.category || "Genel"}` : summary?.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {selectedConversation.messages.length > 0 ? (
                    selectedConversation.messages.map((message) => (
                      <div key={message.id} className={cn("flex flex-col max-w-[75%] space-y-1.5", message.senderId === viewerId ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className={cn("px-5 py-3 rounded-2xl text-sm leading-relaxed", message.senderId === viewerId ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none")}>
                          {message.text}
                        </div>
                        <div className="flex items-center gap-1.5 px-1 text-[10px] text-muted-foreground">
                          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          {message.senderId === viewerId && <CheckCheck className="h-3 w-3 text-primary" />}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-border bg-secondary/50 p-5 text-sm text-muted-foreground">Henüz mesaj yok.</div>
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-3">
                  <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={selectedConversation.type === "support" ? "Destek ekibine mesaj yaz..." : "Mesajınızı yazın..."} className="rounded-2xl h-12 px-4" />
                  <Button type="submit" className="h-12 rounded-2xl px-5">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Henüz görüntülenecek sohbet yok.</div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
