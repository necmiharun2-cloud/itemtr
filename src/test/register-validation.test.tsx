import type { ReactElement } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import Register from "@/pages/Register";

vi.mock("@/lib/auth", () => ({
  registerUser: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(null),
  getUsers: vi.fn(() => []),
  AUTH_CHANGED_EVENT: "itemtr-auth-changed",
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
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>{ui}</MemoryRouter>
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

    fireEvent.change(screen.getAllByPlaceholderText(/kullaniciadi/i)[0], {
      target: { value: "testuser12" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/ornek@email.com/i)[0], {
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

  it("şifre değişince (tekrar alanı dokunulmuşsa) eşleşme hatasını günceller", async () => {
    render(wrapper(<Register />));

    fireEvent.change(screen.getAllByPlaceholderText(/kullaniciadi/i)[0], {
      target: { value: "syncuser1" },
    });
    fireEvent.change(screen.getAllByPlaceholderText(/ornek@email.com/i)[0], {
      target: { value: "sync@example.com" },
    });
    const [pw, pw2] = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(pw, { target: { value: "password1" } });
    fireEvent.change(pw2, { target: { value: "password1" } });
    fireEvent.blur(pw2);

    fireEvent.change(pw, { target: { value: "password2" } });

    await waitFor(() => {
      expect(screen.getByText(/şifreler eşleşmiyor/i)).toBeInTheDocument();
    });
  });
});
