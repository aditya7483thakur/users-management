import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// ✅ Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation links", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<Sidebar />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("highlights the active link correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/users");
    render(<Sidebar />);

    const homeLink = screen.getByText("Home");
    const usersLink = screen.getByText("Users");

    // ✅ Active link has active inline styles
    expect(usersLink).toHaveStyle({
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
    });

    // ✅ Inactive link should NOT have same active colors
    expect(homeLink).not.toHaveStyle({
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
    });
  });

  it("renders the Dashboard heading", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<Sidebar />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
