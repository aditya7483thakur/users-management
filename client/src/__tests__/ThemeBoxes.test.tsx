import ThemeBoxes from "@/components/ThemeBoxes";
import { render, screen, fireEvent } from "@testing-library/react";

// ✅ Mock Zustand store (default)
const setUserMock = jest.fn();

jest.mock("@/providers/store", () => ({
  useThemeStore: () => ({
    setUser: setUserMock,
    customThemes: [], // no custom themes by default
  }),
}));

// ✅ Mock react-query
const mutateMock = jest.fn();
const invalidateQueriesMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    isPending: false,
    mutate: mutateMock,
    variables: null,
  }),
  useQueryClient: () => ({
    invalidateQueries: invalidateQueriesMock,
  }),
}));

// ✅ Mock toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// ✅ Mock getTextColor utility
jest.mock("@/utils/getTextColour", () => ({
  getTextColor: jest.fn(() => "#000000"),
}));

describe("ThemeBoxes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders default theme buttons", () => {
    render(<ThemeBoxes />);
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
  });

  it("calls mutate when Apply button is clicked", () => {
    render(<ThemeBoxes />);
    const applyButtons = screen.getAllByRole("button", { name: /apply/i });
    fireEvent.click(applyButtons[1]);
    expect(mutateMock).toHaveBeenCalled();
  });

  it("renders delete button for custom themes and triggers delete mutation", async () => {
    // 👇 Reset all module caches so we can safely re-mock
    jest.resetModules();

    // Mock the store to include a custom theme
    jest.doMock("@/providers/store", () => ({
      useThemeStore: () => ({
        setUser: setUserMock,
        customThemes: [{ name: "custom1", hex: "#123456" }],
      }),
    }));

    // ✅ Re-import ThemeBoxes inside isolated context so the new mock applies
    let ReImportedThemeBoxes: any;
    await jest.isolateModulesAsync(async () => {
      ReImportedThemeBoxes = (await import("@/components/ThemeBoxes")).default;
    });

    render(<ReImportedThemeBoxes />);

    const deleteButton = screen.getByTitle("Delete Theme");
    fireEvent.click(deleteButton);

    expect(mutateMock).toHaveBeenCalled();
  });
});
