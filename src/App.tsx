import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import BotManager from "@/components/BotManager";
import { FloatingSupport } from "@/components/LiveChat";
import { getCurrentUser, seedAuth } from "@/lib/auth";
import { seedMessaging } from "@/lib/messaging";
import { testSupabaseConnection } from "@/lib/supabase";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ListingDetail from "./pages/ListingDetail.tsx";
import Category from "./pages/Category.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Profile from "./pages/Profile.tsx";
import Stores from "./pages/Stores.tsx";
import Giveaways from "./pages/Giveaways.tsx";
import Blog from "./pages/Blog.tsx";
import Support from "./pages/Support.tsx";
import Deposit from "./pages/Deposit.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AddListing from "./pages/AddListing.tsx";
import EditListing from "./pages/EditListing.tsx";
import Messages from "./pages/Messages.tsx";
import Checkout from "./pages/Checkout.tsx";
import Orders from "./pages/Orders.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Admin from "./pages/Admin.tsx";
import Legal from "./pages/Legal.tsx";
import Reviews from "./pages/Reviews.tsx";
import SearchResult from "./pages/SearchResult.tsx";
import SSS from "./pages/SSS.tsx";
import Vitrin from "./pages/Vitrin.tsx";
import PvpServers from "./pages/PvpServers.tsx";
import About from "./pages/About.tsx";
import Contact from "./pages/Contact.tsx";

const queryClient = new QueryClient();

const Bootstrap = () => {
  useEffect(() => {
    seedAuth();
    seedMessaging();
    
    // Test Supabase connection on app load (only in development)
    if (import.meta.env.DEV) {
      testSupabaseConnection().then((result) => {
        if (result.success) {
          console.log("[App] Supabase connected successfully");
        } else {
          console.warn("[App] Supabase connection failed - using local storage fallback");
        }
      });
    }
  }, []);

  return null;
};

const ProtectedRoute = ({ children, adminOnly = false }: { children: JSX.Element; adminOnly?: boolean }) => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkAuth();
  }, [location.pathname]);

  if (loading) return <div className="min-h-screen bg-background" />;

  if (!user) {
    const target = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const GuestOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    checkAuth();
  }, [location.pathname]);

  if (loading) return <div className="min-h-screen bg-background" />;

  const redirectTarget = new URLSearchParams(location.search).get("redirect") || "/dashboard";
  return user ? <Navigate to={redirectTarget} replace /> : children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="vite-ui-theme" enableSystem>
      <TooltipProvider>
        <BotManager />
        <Bootstrap />
        <Toaster />
        <Sonner />
        <FloatingSupport />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/category" element={<Category />} />
            <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
            <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />
            <Route path="/seller/:username" element={<Profile />} />
            <Route path="/stores" element={<Stores />} />
            <Route path="/giveaways" element={<Giveaways />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/support" element={<Support />} />
            <Route path="/deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/add-listing" element={<ProtectedRoute><AddListing /></ProtectedRoute>} />
            <Route path="/edit-listing/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
            <Route path="/legal/:type" element={<Legal />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/search" element={<SearchResult />} />
            <Route path="/sss" element={<SSS />} />
            <Route path="/faq" element={<Navigate to="/sss" replace />} />
            <Route path="/terms" element={<Navigate to="/legal/terms" replace />} />
            <Route path="/privacy" element={<Navigate to="/legal/kvkk" replace />} />
            <Route path="/dashboard/support-tickets" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/vitrin-al" element={<ProtectedRoute><Vitrin /></ProtectedRoute>} />
            <Route path="/pvp-serverlar" element={<PvpServers />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
