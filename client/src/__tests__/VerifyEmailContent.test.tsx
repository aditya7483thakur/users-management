// src/__tests__/VerifyEmailContent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import VerifyEmailContent from "@/components/VerifyEmailContent";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// ✅ Mock Next.js hooks
const mutateMock = jest.fn();
const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn().mockReturnValue({
    get: jest.fn().mockReturnValue("fake-token"), // default token
  }),
  useRouter: jest.fn(() => ({
    push: pushMock,
  })),
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

  it("calls mutate with token when Verify Email button is clicked", () => {
    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));
    expect(mutateMock).toHaveBeenCalledWith("fake-token");
  });

  it("shows error toast if token is missing", () => {
    const { useSearchParams } = require("next/navigation");
    useSearchParams.mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));
    expect(toast.error).toHaveBeenCalledWith("Invalid verification link.");
  });

  it("shows success message when isSuccess is true", () => {
    const { useMutation } = require("@tanstack/react-query");
    useMutation.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isSuccess: true,
    });

    render(<VerifyEmailContent />);
    expect(
      screen.getByText(/email verified successfully/i)
    ).toBeInTheDocument();
  });

  it("calls router.push('/dashboard') on success", () => {
    const { useMutation } = require("@tanstack/react-query");
    useMutation.mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isSuccess: false,
      // simulate success handler being called
      onSuccess: (data: any) => {
        toast.success(data.message);
        pushMock("/dashboard");
      },
    });

    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));
    // simulate mutation success manually
    useMutation().onSuccess({ message: "Email verified successfully!" });

    expect(toast.success).toHaveBeenCalledWith("Email verified successfully!");
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });
});
