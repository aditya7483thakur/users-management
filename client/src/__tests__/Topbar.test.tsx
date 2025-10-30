// src/__tests__/Topbar.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import Topbar from "@/components/Topbar";
import { useThemeStore } from "@/providers/store";
type ThemeStoreType = ReturnType<typeof useThemeStore>;
// ✅ Mock Zustand store
const pushMock = jest.fn();
const nameMock = "TestUser";

jest.mock("@/providers/store", () => {
  return {
    useThemeStore: (selector: (state: ThemeStoreType) => unknown) =>
      selector({ name: nameMock } as ThemeStoreType),
  };
});

// ✅ Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

// ✅ Mock react-query
const mutateMock = jest.fn();
const clearMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({ isPending: false, mutate: mutateMock }),
  useQueryClient: () => ({ clear: clearMock }),
}));

jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Topbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the user's name", () => {
    render(<Topbar />);
    expect(screen.getByText(`Hi ${nameMock} 👋`)).toBeInTheDocument();
  });

  it("navigates to profile page when profile image is clicked", () => {
    render(<Topbar />);
    fireEvent.click(screen.getByAltText("User"));
    expect(pushMock).toHaveBeenCalledWith("/dashboard/edit-profile");
  });

  it("calls mutate when logout button is clicked", () => {
    render(<Topbar />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    expect(mutateMock).toHaveBeenCalled();
  });
});
