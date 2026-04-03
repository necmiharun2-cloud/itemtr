import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import Register from "@/pages/Register";

vi.mock("@/lib/auth", () => ({
  registerUser: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

const wrapper = (ui: ReactElement) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Register doğrulama", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("8 karakterden kısa şifre ile kayıt denemesinde hata gösterir ve registerUser çağrılmaz", async () => {
    const { registerUser } = await import("@/lib/auth");
    render(
      wrapper(
        <Register />,
      ),
    );

    fireEvent.change(screen.getByPlaceholderText(/kullaniciadi/i), {
      target: { value: "testuser12" },
    });
    fireEvent.change(screen.getByPlaceholderText(/ornek@email.com/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[0], {
      target: { value: "short1" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/••••••••/i)[1], {
      target: { value: "short1" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^kayıt ol$/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Lütfen form hatalarını düzeltin");
    });
    expect(registerUser).not.toHaveBeenCalled();
    expect(screen.getByText(/şifre en az 8 karakter/i)).toBeInTheDocument();
  });
});
