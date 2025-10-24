import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Sidebar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all links", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<Sidebar />);

    // Check all link texts
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  it("highlights the active link correctly", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard/users");
    render(<Sidebar />);

    const homeLink = screen.getByText("Home");
    const usersLink = screen.getByText("Users");

    // Active link should have bg-text / color-bg styles
    expect(usersLink).toHaveStyle({
      backgroundColor: "var(--text)",
      color: "var(--bg)",
    });

    // Inactive link should NOT have active styles
    expect(homeLink).not.toHaveStyle({ backgroundColor: "var(--text)" });
  });

  it("renders Dashboard heading", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    render(<Sidebar />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
