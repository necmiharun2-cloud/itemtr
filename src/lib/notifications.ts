import { safeJSONParse } from "@/lib/utils";

export type NotificationType = "listing" | "order" | "system" | "support" | "wallet";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  href: string;
  type: NotificationType;
  isRead: boolean;
};

const NOTIFICATIONS_KEY = "itemtr_notifications";

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-listing-1",
    title: "Yeni mağaza ilanı",
    description: "Takip ettiğiniz IlkanShop yeni bir ilan yayınladı.",
    time: "5 dk önce",
    href: "/category",
    type: "listing",
    isRead: false,
  },
  {
    id: "notif-order-1",
    title: "Sipariş onayı",
    description: "#ORD-9921 nolu siparişiniz başarıyla tamamlandı.",
    time: "1 sa önce",
    href: "/orders",
    type: "order",
    isRead: false,
  },
  {
    id: "notif-support-1",
    title: "Destek talebi güncellendi",
    description: "Açık destek kaydınıza yeni yanıt eklendi.",
    time: "Bugün",
    href: "/dashboard?tab=support",
    type: "support",
    isRead: true,
  },
  {
    id: "notif-wallet-1",
    title: "Bakiye bildirimi",
    description: "Para çekme talebiniz inceleme sırasına alındı.",
    time: "Dün",
    href: "/dashboard?tab=wallet",
    type: "wallet",
    isRead: true,
  },
  {
    id: "notif-system-1",
    title: "Sistem mesajı",
    description: "Yeni vitrin ve etiket düzeni yayınlandı.",
    time: "Dün",
    href: "/dashboard?tab=overview#panel-bildirimleri",
    type: "system",
    isRead: true,
  },
];

const emitNotificationUpdate = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("itemtr-notifications-updated"));
  }
};

export const seedNotifications = () => {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem(NOTIFICATIONS_KEY);
  if (!existing) {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
};

export const getNotifications = (): NotificationItem[] => {
  if (typeof window === "undefined") return DEFAULT_NOTIFICATIONS;
  seedNotifications();
  const parsed = safeJSONParse<NotificationItem[]>(localStorage.getItem(NOTIFICATIONS_KEY), DEFAULT_NOTIFICATIONS);
  return Array.isArray(parsed) ? parsed : DEFAULT_NOTIFICATIONS;
};

export const saveNotifications = (items: NotificationItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(items));
  emitNotificationUpdate();
};

export const markNotificationRead = (notificationId: string) => {
  const nextItems = getNotifications().map((item) =>
    item.id === notificationId ? { ...item, isRead: true } : item,
  );
  saveNotifications(nextItems);
};

export const markAllNotificationsRead = () => {
  const nextItems = getNotifications().map((item) => ({ ...item, isRead: true }));
  saveNotifications(nextItems);
};

export const getUnreadNotificationCount = () => getNotifications().filter((item) => !item.isRead).length;
