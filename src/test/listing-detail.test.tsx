import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import ListingDetail from "@/pages/ListingDetail";
import { getCurrentUser } from "@/lib/auth";

const { supabaseSingleResultRef } = vi.hoisted(() => ({
  supabaseSingleResultRef: {
    current: Promise.resolve({ data: null, error: { message: "not found" } }) as Promise<{
      data: unknown;
      error: unknown;
    }>,
  },
}));

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
      single: () => Promise<{ data: unknown; error: unknown }>;
    };
    c.select = () => c;
    c.eq = () => c;
    c.single = () => supabaseSingleResultRef.current;
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

describe("ListingDetail page", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    supabaseSingleResultRef.current = Promise.resolve({ data: null, error: { message: "not found" } });
  });

  const renderListing = (path: string) =>
    render(
      <TooltipProvider>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Routes>
            <Route path="/listing/:id" element={<ListingDetail />} />
          </Routes>
        </MemoryRouter>
      </TooltipProvider>,
    );

  it("renders seed marketplace listing with purchase enabled", async () => {
    renderListing("/listing/V-101");
    expect(await screen.findByRole("heading", { level: 1, name: /Global Elite/i })).toBeInTheDocument();
    const buy = await screen.findByRole("button", { name: /^Satın Al$/i });
    expect(buy).not.toBeDisabled();
  });

  it("shows not found for unknown listing id", async () => {
    renderListing("/listing/__no_such_listing_xyz__");
    expect(await screen.findByRole("heading", { name: /İlan bulunamadı/i })).toBeInTheDocument();
  });

  it("disables purchase for BOT- fallback listings", async () => {
    renderListing("/listing/BOT-XYZ");
    const off = await screen.findAllByRole("button", { name: /ürün satışta değil/i });
    expect(off[0]).toBeDisabled();
    expect(screen.getAllByText(/bot ilanını satın alamaz/i).length).toBeGreaterThan(0);
  });

  it("links help card to yardım merkezi", async () => {
    renderListing("/listing/V-101");
    await screen.findByRole("heading", { level: 1, name: /Global Elite/i });
    const main = screen.getAllByRole("main")[0];
    const help = within(main).getByRole("link", { name: /Yardıma mı ihtiyacınız var/i });
    expect(help).toHaveAttribute("href", "/support");
  });
});
