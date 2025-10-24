import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import "@testing-library/jest-dom";
import Navbar from "@/components/Navbar";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

describe("Navbar Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Navbar when not on /dashboard", () => {
    (usePathname as jest.Mock).mockReturnValue("/login");
    render(<Navbar />);
    expect(screen.getByText("MyApp")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("does not render Navbar when on /dashboard route", () => {
    (usePathname as jest.Mock).mockReturnValue("/dashboard");
    const { container } = render(<Navbar />);
    expect(container.firstChild).toBeNull();
  });
});
