import ThemeBoxes from "@/components/ThemeBoxes";
import { render, screen, fireEvent } from "@testing-library/react";

// ✅ Type-safe mock for Zustand store
const setUserMock = jest.fn();

jest.mock("@/providers/store", () => ({
  useThemeStore: () => ({
    setUser: setUserMock, // match the store shape
  }),
}));

// ✅ Type-safe mock for react-query
const mutateMock = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    isPending: false,
    mutate: mutateMock,
    variables: null,
  }),
}));

jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
}));

describe("ThemeBoxes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders theme buttons", () => {
    render(<ThemeBoxes />);
    expect(screen.getByText("light")).toBeInTheDocument();
    expect(screen.getByText("dark")).toBeInTheDocument();
    expect(screen.getByText("red")).toBeInTheDocument();
  });

  it("calls mutate when a theme button is clicked", () => {
    render(<ThemeBoxes />);
    fireEvent.click(screen.getByText("dark"));
    expect(mutateMock).toHaveBeenCalledWith({ theme: "dark" });
  });
});
