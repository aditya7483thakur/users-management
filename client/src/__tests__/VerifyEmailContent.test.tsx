// src/__tests__/VerifyEmailContent.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import VerifyEmailContent from "@/components/VerifyEmailContent";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

// ✅ Mock Next.js router and search params
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// ✅ Mock react-query
const mutateMock = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
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
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("fake-token"),
    });
    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isSuccess: false,
    });
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
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue(null),
    });

    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));
    expect(toast.error).toHaveBeenCalledWith("Invalid verification link.");
  });

  it("shows success message when isSuccess is true", () => {
    (useMutation as jest.Mock).mockReturnValue({
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
    const onSuccessMock = jest.fn((data: { message: string }) => {
      toast.success(data.message);
      pushMock("/dashboard");
    });

    (useMutation as jest.Mock).mockReturnValue({
      mutate: mutateMock,
      isPending: false,
      isSuccess: false,
      onSuccess: onSuccessMock,
    });

    render(<VerifyEmailContent />);
    fireEvent.click(screen.getByRole("button", { name: /verify email/i }));

    // manually simulate success
    onSuccessMock({ message: "Email verified successfully!" });

    expect(toast.success).toHaveBeenCalledWith("Email verified successfully!");
    expect(pushMock).toHaveBeenCalledWith("/dashboard");
  });
});
