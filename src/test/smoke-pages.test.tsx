import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getCurrentUser } from "@/lib/auth";
import Admin from "@/pages/Admin";
import Checkout from "@/pages/Checkout";
import Dashboard from "@/pages/Dashboard";
import Legal from "@/pages/Legal";
import ListingDetail from "@/pages/ListingDetail";
import SSS from "@/pages/SSS";
import Support from "@/pages/Support";

const mockDashboardUser = {
  id: "test-user-1",
  name: "Test User",
  username: "testuser",
  email: "test@itemtr.com",
  phone: "",
  avatar: "",
  balance: 100,
  rating: 5,
  isVerified: false,
  role: "user" as const,
  about: "",
  smsSecurityEnabled: false,
  bankAccountAdded: false,
  levelState: { xp: 0, counts: {} as Record<string, number>, history: [] as unknown[] },
  createdAt: "2025-01-01T00:00:00.000Z",
};

const mockAdminUser = {
  ...mockDashboardUser,
  id: "admin-root",
  username: "admin",
  role: "admin" as const,
};

vi.mock("@/lib/auth", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth")>();
  return {
    ...mod,
    getCurrentUser: vi.fn(mod.getCurrentUser),
  };
});

vi.mock("@/lib/supabase", () => {
  const chain = () => {
    const c: Record<string, unknown> = {};
    const self = c as {
      select: () => typeof c;
      eq: () => typeof c;
      or: () => typeof c;
      order: () => Promise<{ data: unknown[]; error: null }>;
      single: () => Promise<{ data: null; error: { message: string } }>;
      insert: () => Promise<{ error: null }>;
      update: () => Promise<{ error: null }>;
    };
    c.select = () => c;
    c.eq = () => c;
    c.or = () => c;
    c.order = () => Promise.resolve({ data: [], error: null });
    c.single = () => Promise.resolve({ data: null, error: { message: "not found" } });
    c.insert = () => Promise.resolve({ error: null });
    c.update = () => Promise.resolve({ error: null });
    return self;
  };
  return {
    supabase: {
      from: vi.fn(chain),
      auth: { getUser: vi.fn() },
      rpc: vi.fn(),
    },
  };
});

describe("critical page smoke tests", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getCurrentUser).mockResolvedValue(mockDashboardUser as never);
  });

  const renderAt = (path: string, element: React.ReactNode, routePath?: string) =>
    render(
      <TooltipProvider>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path={routePath ?? path} element={element} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>,
    );

  it("blocks bot listings on listing detail page", async () => {
    renderAt("/listing/BOT-TEST", <ListingDetail />, "/listing/:id");

    expect(await screen.findByRole("button", { name: /ürün satışta değil/i })).toBeDisabled();
    expect(screen.getByText(/bot ilanını satın alamaz/i)).toBeInTheDocument();
  });

  it("blocks checkout for bot listings", async () => {
    renderAt("/checkout?listingId=BOT-TEST", <Checkout />, "/checkout");

    expect(await screen.findByRole("heading", { name: /Ürün Satışta Değil/i })).toBeInTheDocument();
    expect(screen.getByText(/test ilanıdır/i)).toBeInTheDocument();
  });

  it("opens the dashboard support tab from query string", async () => {
    renderAt("/dashboard?tab=support", <Dashboard />, "/dashboard");

    expect(await screen.findByText(/Destek Taleplerim/i)).toBeInTheDocument();
    expect(screen.getByText(/Yeni Talep/i)).toBeInTheDocument();
  });

  it("renders the admin bot panel after switching tabs", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(mockAdminUser as never);
    renderAt("/admin", <Admin />);

    const botTab = await screen.findByRole("tab", { name: /İLAN BOTU/i });
    fireEvent.mouseDown(botTab);
    fireEvent.click(botTab);

    await waitFor(() => {
      expect(screen.getByText(/Bot Ayarları/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Bot İsim Havuzu/i)).toBeInTheDocument();
    expect(screen.getByText(/Satış Kilidi/i)).toBeInTheDocument();
  });

  it("renders the support page", async () => {
    renderAt("/support", <Support />);
    expect(await screen.findByText(/Yardım Merkezi/i)).toBeInTheDocument();
  });

  it("renders the FAQ page", async () => {
    renderAt("/sss", <SSS />);
    expect(await screen.findByText(/YARDIMCI OLABİLİRİZ/i)).toBeInTheDocument();
  });

  it("renders the legal page", async () => {
    renderAt("/legal/terms", <Legal />, "/legal/:type");
    expect(await screen.findByRole("heading", { name: /Kullanım Koşulları/i })).toBeInTheDocument();
  });
});
