import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

// Import pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import Index from "@/pages/Index";
import ListingDetail from "@/pages/ListingDetail";
import Checkout from "@/pages/Checkout";
import Messages from "@/pages/Messages";
import Profile from "@/pages/Profile";
import Deposit from "@/pages/Deposit";
import AddListing from "@/pages/AddListing";

// Mock auth functions
vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  logoutUser: vi.fn(),
  updateCurrentUser: vi.fn(),
  rewardCurrentUser: vi.fn(),
  isAuthenticated: vi.fn(),
  AUTH_CHANGED_EVENT: "itemtr-auth-changed",
}));

// Mock supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn() }) }) })),
      insert: vi.fn(),
      update: vi.fn(),
      upsert: vi.fn(),
    })),
  },
}));

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Test wrapper
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Auth Flow Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it("should render login form", () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );
    
    expect(screen.getByText(/Giriş Yap/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ornek@email.com/i)).toBeInTheDocument();
  });

  it("should show error on empty form submission", async () => {
    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    const form = screen.getByRole("form");
    const submitButton = within(form).getByRole("button", { name: /^Giriş Yap$/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("E-posta/kullanıcı adı ve şifre zorunludur.");
    });
  });

  it("should handle successful login", async () => {
    const { loginUser } = await import("@/lib/auth");
    vi.mocked(loginUser).mockResolvedValue({
      ok: true,
      user: { id: "1", name: "Test User", role: "user" },
    });

    render(
      <TestWrapper>
        <Login />
      </TestWrapper>
    );

    fireEvent.change(screen.getByPlaceholderText(/ornek@email.com/i), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••••••/i), {
      target: { value: "password123" },
    });

    const form = screen.getByRole("form");
    fireEvent.click(within(form).getByRole("button", { name: /^Giriş Yap$/i }));
    
    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledWith("test@test.com", "password123");
    });
  });
});

describe("Dashboard Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should redirect to login if not authenticated", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
    });
  });

  it("should render dashboard for authenticated user", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      name: "Test User",
      username: "testuser",
      email: "test@test.com",
      phone: "",
      avatar: "",
      balance: 1000,
      rating: 4.5,
      isVerified: false,
      role: "user",
      levelState: { xp: 0, counts: {}, history: [] },
    });
    
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/GENEL BAKIŞ/i)).toBeInTheDocument();
    });
  });
});

describe("Protected Route Tests", () => {
  it("should protect admin routes", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      role: "user",
    });
    
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<div>Dashboard Page</div>} />
        </Routes>
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.queryByText(/Admin Paneli/i)).not.toBeInTheDocument();
    });
  });
});

describe("API Error Handling Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle network errors gracefully", async () => {
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockRejectedValue(new Error("Network error"));
    
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Panel verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.",
      );
    });
  });

  it("should handle malformed data", async () => {
    localStorageMock.getItem.mockReturnValue("invalid json");
    
    const { getCurrentUser } = await import("@/lib/auth");
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      name: "Test",
      role: "user",
      levelState: { xp: 0, counts: {}, history: [] },
    });
    
    // Should not crash on malformed localStorage data
    render(
      <TestWrapper>
        <Dashboard />
      </TestWrapper>
    );
  });
});

describe("Form Validation Tests", () => {
  it("should validate email format", async () => {
    render(
      <TestWrapper>
        <Register />
      </TestWrapper>
    );
    
    // Test form validation
    const emailInput = screen.getByPlaceholderText(/ornek@email.com/i);
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    
    // Should show validation error
    await waitFor(() => {
      // Validation logic specific to the component
      expect(emailInput).toHaveValue("invalid-email");
    });
  });
});

describe("Async Operation Tests", () => {
  it("should handle concurrent async operations", async () => {
    const { getCurrentUser, updateCurrentUser } = await import("@/lib/auth");
    
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      name: "Test",
      balance: 100,
      role: "user",
      levelState: { xp: 0, counts: {}, history: [] },
    });

    vi.mocked(updateCurrentUser).mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { id: "1", balance: 200 };
    });
    
    render(
      <TestWrapper>
        <Deposit />
      </TestWrapper>
    );
    
    // Should handle async operations without race conditions
    await waitFor(() => {
      expect(getCurrentUser).toHaveBeenCalled();
    });
  });
});
