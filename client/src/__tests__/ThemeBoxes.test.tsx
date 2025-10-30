import ThemeBoxes from "@/components/ThemeBoxes";
import { useThemeStore } from "@/providers/store";
import { render, screen, fireEvent } from "@testing-library/react";
type ThemeStoreType = ReturnType<typeof useThemeStore>;

const setUserMock = jest.fn();

jest.mock("@/providers/store", () => {
  return {
    useThemeStore: (selector: (state: ThemeStoreType) => unknown) =>
      selector({ setUser: setUserMock, customThemes: [] } as ThemeStoreType),
  };
});

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
});
