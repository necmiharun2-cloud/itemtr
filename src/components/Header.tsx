import { useEffect, useMemo, useRef, useState } from "react";
import { Search, User, Globe, Bell, Wallet, ChevronDown, LayoutDashboard, MessageCircle, ShieldCheck, ShoppingBag, PlusCircle, LogOut, LogIn, ChevronLeft, Gamepad2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AUTH_CHANGED_EVENT, getCurrentUser, logoutUser } from "@/lib/auth";
import { getVisibleConversations, viewerIdentityIds } from "@/lib/messaging";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  seedNotifications,
  type NotificationItem,
} from "@/lib/notifications";
import { toast } from "sonner";

const searchSuggestions = [
  "Steam Cüzdan Kodu", "Valorant VP", "Roblox Robux", "Netflix Hesap",
  "Discord Nitro", "TikTok Takipçi", "CS2 Hesap", "Minecraft Premium",
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLang, setSelectedLang] = useState("TR");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [balance, setBalance] = useState(0);
  const [role, setRole] = useState<"user" | "admin">("user");
  const [displayName, setDisplayName] = useState("Hesabım");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [messageUnreadCount, setMessageUnreadCount] = useState(0);
  const bellRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  // Geri butonu göster (ana sayfa ve / hariç)
  const showBackButton = location.pathname !== "/" && location.pathname !== "";

  const filteredSuggestions = useMemo(
    () => searchSuggestions.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery],
  );

  useEffect(() => {
    const syncHeaderState = async () => {
      seedNotifications();
      setNotifications(getNotifications());

      const currentUser = await getCurrentUser();
      setIsAuthenticated(Boolean(currentUser));
      setDisplayName(currentUser?.name || "Hesabım");
      setBalance(Number(currentUser?.balance) || 0);
      setRole(currentUser?.role === "admin" ? "admin" : "user");

      if (currentUser) {
        const conversations = await getVisibleConversations();
        const vids = viewerIdentityIds(currentUser);
        const unread = (conversations || []).filter((conversation) =>
          (conversation.unreadBy || []).some((uid) => vids.includes(uid)),
        ).length;
        setMessageUnreadCount(unread);
      } else {
        setMessageUnreadCount(0);
      }
    };

    syncHeaderState();
    window.addEventListener("itemtr-notifications-updated", () => syncHeaderState());
    window.addEventListener("storage", () => syncHeaderState());
    window.addEventListener(AUTH_CHANGED_EVENT, () => syncHeaderState());
    window.addEventListener("itemtr-messaging-updated", () => syncHeaderState());

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bellRef.current && !bellRef.current.contains(target)) setShowNotifications(false);
      if (accountRef.current && !accountRef.current.contains(target)) setShowAccountMenu(false);
    };

    document.addEventListener("mousedown", handleOutside);
    return () => {
      window.removeEventListener("itemtr-notifications-updated", () => syncHeaderState());
      window.removeEventListener("storage", () => syncHeaderState());
      window.removeEventListener(AUTH_CHANGED_EVENT, () => syncHeaderState());
      window.removeEventListener("itemtr-messaging-updated", () => syncHeaderState());
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications]);

  const runSearch = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;
    navigate(`/search?q=${encodeURIComponent(normalized)}`);
    setShowSuggestions(false);
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    markNotificationRead(notification.id);
    setNotifications(getNotifications());
    setShowNotifications(false);
    navigate(notification.href);
  };

  const handleLogout = async () => {
    await logoutUser();
    setShowAccountMenu(false);
    toast.success("Çıkış yapıldı.");
    navigate("/login");
  };

  return (
    <div className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-card/90">
      <div className="container flex items-center justify-between py-3 gap-4">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          {showBackButton && (
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors mr-1"
              title="Geri"
            >
              <ChevronLeft className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
              <Gamepad2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xl font-black text-foreground tracking-tight leading-none">
                İtem<span className="text-primary">TR</span>
              </span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider">GÜVENLİ OYUN PAZARYERİ</span>
            </div>
          </div>
        </Link>

        <div className="relative group hidden md:block">
          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Globe className="h-4 w-4" />
            <span>{selectedLang}</span>
            <ChevronDown className="h-3 w-3" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl z-50 hidden group-hover:block min-w-[96px]">
            {["TR", "EN"].map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={cn(
                  "block w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors",
                  lang === selectedLang ? "text-primary font-medium" : "text-muted-foreground",
                )}
              >
                {lang === "TR" ? "🇹🇷 Türkçe" : "🇬🇧 English"}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 max-w-xl relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Ürün, oyun veya mağaza ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runSearch(searchQuery);
              }}
              className="w-full bg-secondary border border-border rounded-xl py-2.5 px-4 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button onClick={() => runSearch(searchQuery)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-4 w-4" />
            </button>
          </div>

          {showSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
              {searchQuery === "" ? (
                <div className="p-3">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">🔥 Popüler Aramalar</p>
                  <div className="flex flex-wrap gap-2">
                    {searchSuggestions.slice(0, 6).map((s) => (
                      <button key={s} onMouseDown={() => runSearch(s)} className="px-3 py-1 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                        {s}
                      </button>
                    ))}
                  </div>
                  <li>
                    <Link to="/register" className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
                      <ChevronRight className="h-3 w-3" />
                      Kayıt Ol
                    </Link>
                  </li>
                </div>
              ) : filteredSuggestions.length > 0 ? (
                filteredSuggestions.map((s) => (
                  <button key={s} onMouseDown={() => runSearch(s)} className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                    <Search className="h-3.5 w-3.5" />
                    {s}
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">Sonuç bulunamadı</div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <Link to="/deposit" className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors shrink-0">
              <Wallet className="h-4 w-4" />
              <span>{balance.toFixed(2)} ₺</span>
            </Link>
          )}

          {isAuthenticated && (
            <div className="relative" ref={bellRef}>
              <button onClick={() => setShowNotifications((prev) => !prev)} className="relative p-2.5 rounded-xl bg-secondary text-muted-foreground hover:text-foreground transition-colors shrink-0 flex">
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-[340px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Bildirimler</p>
                      <p className="text-xs text-muted-foreground">{unreadCount} okunmamış bildirim</p>
                    </div>
                    <button onClick={() => { markAllNotificationsRead(); setNotifications(getNotifications()); }} className="text-xs font-medium text-primary hover:underline">
                      Tümünü oku
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <button key={notification.id} onClick={() => handleNotificationClick(notification)} className={cn("w-full text-left px-4 py-3 border-b border-border/60 hover:bg-secondary/60 transition-colors", !notification.isRead && "bg-primary/5")}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{notification.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.description}</p>
                          </div>
                          {!notification.isRead && <span className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0" />}
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-2">{notification.time}</p>
                      </button>
                    ))}
                  </div>
                  <Link to="/dashboard?tab=overview#panel-bildirimleri" className="block px-4 py-3 text-sm font-medium text-primary hover:bg-secondary/60">Tüm bildirim merkezine git</Link>
                </div>
              )}
            </div>
          )}

          <div className="relative" ref={accountRef}>
            <button onClick={() => setShowAccountMenu((prev) => !prev)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shrink-0">
              {isAuthenticated ? <User className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
              <span className="hidden sm:inline">{displayName}</span>
              <ChevronDown className="h-4 w-4 hidden sm:inline" />
            </button>

            {showAccountMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3 border-b border-border/70">
                      <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{role === "admin" ? "Yönetici hesabı" : `${messageUnreadCount} okunmamış mesaj`}</p>
                    </div>
                    <Link to="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground"><LayoutDashboard className="h-4 w-4 text-primary" /> Panel</Link>
                    <Link to="/orders" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground"><ShoppingBag className="h-4 w-4 text-primary" /> Siparişler</Link>
                    <Link to="/messages" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground"><MessageCircle className="h-4 w-4 text-primary" /> Mesajlar {messageUnreadCount > 0 && <span className="ml-auto text-[10px] font-black text-primary">{messageUnreadCount}</span>}</Link>
                    <Link to="/add-listing" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground"><PlusCircle className="h-4 w-4 text-primary" /> İlan Ekle</Link>
                    {role === "admin" && (
                      <Link to="/admin" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" /> Admin Paneli
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground border-t border-border/70">
                      <LogOut className="h-4 w-4 text-primary" /> Çıkış Yap
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground"><LogIn className="h-4 w-4 text-primary" /> Giriş Yap</Link>
                    <Link to="/register" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-secondary/60 text-foreground border-t border-border/70">
                      <User className="h-4 w-4 text-primary" /> Kayıt Ol
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
