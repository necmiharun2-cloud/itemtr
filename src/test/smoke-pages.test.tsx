import type React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import Admin from "@/pages/Admin";
import Checkout from "@/pages/Checkout";
import Dashboard from "@/pages/Dashboard";
import Legal from "@/pages/Legal";
import ListingDetail from "@/pages/ListingDetail";
import SSS from "@/pages/SSS";
import Support from "@/pages/Support";

describe("critical page smoke tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const renderAt = (path: string, element: React.ReactNode, routePath?: string) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={routePath ?? path} element={element} />
        </Routes>
      </MemoryRouter>,
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
    expect(screen.getByText(/Yeni Talep Oluştur/i)).toBeInTheDocument();
  });

  it("renders the admin bot panel after switching tabs", async () => {
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
