import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import SetPasswordContent from "@/components/SetPasswordContent";

// --- MOCKS --- //
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(),
}));

jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// --- TEST SUITE --- //
describe("SetPasswordContent", () => {
  const pushMock = jest.fn();
  const mutateMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: jest.fn().mockReturnValue("fake-token"),
    });
    (useMutation as jest.Mock).mockReturnValue({
      isPending: false,
      mutate: mutateMock,
    });
  });

  it("renders correctly", () => {
    render(<SetPasswordContent />);

    expect(screen.getByText("Set New Password")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter new password")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Confirm new password")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /set password/i })
    ).toBeInTheDocument();
  });

  it("shows error if passwords do not match", async () => {
    render(<SetPasswordContent />);

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /set password/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Passwords do not match");
      expect(mutateMock).not.toHaveBeenCalled();
    });
  });

  it("calls mutate with correct data when passwords match", async () => {
    render(<SetPasswordContent />);

    fireEvent.change(screen.getByPlaceholderText("Enter new password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm new password"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: /set password/i }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        token: "fake-token",
        password: "123456",
        confirmPassword: "123456",
      });
    });
  });
});
