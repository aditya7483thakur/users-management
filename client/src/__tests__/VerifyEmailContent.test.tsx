// src/__tests__/VerifyEmailContent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import VerifyEmailContent from "@/components/VerifyEmailContent";
import toast from "react-hot-toast";

// ✅ Mock Next.js hooks
const mutateMock = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue("fake-token"), // mock token
  }),
}));

// ✅ Mock react-query
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: mutateMock,
    isPending: false,
    isSuccess: false,
  })),
}));

// ✅ Mock toast
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("VerifyEmailContent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Verify Email button", () => {
    render(<VerifyEmailContent />);
    expect(
      screen.getByRole("button", { name: /verify email/i })
    ).toBeInTheDocument();
  });

  it("calls mutate when Verify Email button is clicked", () => {
    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));
    expect(mutateMock).toHaveBeenCalledWith("fake-token");
  });

  it("shows error toast if token is missing", () => {
    // Override useSearchParams to return null token
    const { useSearchParams } = require("next/navigation");
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));
    expect(toast.error).toHaveBeenCalledWith("Invalid verification link.");
  });
});
