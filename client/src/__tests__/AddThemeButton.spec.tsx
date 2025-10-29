import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AddThemeButton from "@/components/AddThemeButton";

// --- Mock dependencies ---
const toastSuccessMock = jest.fn();
const toastErrorMock = jest.fn();
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: (msg: string) => toastSuccessMock(msg),
    error: (msg: string) => toastErrorMock(msg),
  },
}));

const mutateMock = jest.fn();
jest.mock("@tanstack/react-query", () => ({
  useMutation: jest.fn(() => ({
    mutate: mutateMock,
    isPending: false,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

// Mock the Modal component to just render its children when open
jest.mock("@/components/Modal", () => ({
  __esModule: true,
  default: ({ isOpen, children }: any) =>
    isOpen ? <div>{children}</div> : null,
}));

// Mock schema to make validation deterministic
jest.mock("@/lib/schemas", () => ({
  addCustomThemeSchema: {
    safeParse: jest.fn((data) =>
      data.name
        ? { success: true, data }
        : {
            success: false,
            error: { issues: [{ message: "Name is required" }] },
          }
    ),
  },
}));

describe("AddThemeButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens modal when button is clicked", () => {
    render(<AddThemeButton />);
    fireEvent.click(screen.getByText("+ Add Theme"));
    expect(screen.getByText("Add Custom Theme")).toBeInTheDocument();
  });

  it("calls mutate when valid input is given", async () => {
    render(<AddThemeButton />);
    fireEvent.click(screen.getByText("+ Add Theme"));

    fireEvent.change(screen.getByPlaceholderText("e.g. Ocean Blue"), {
      target: { value: "Ocean Blue" },
    });
    fireEvent.change(screen.getByDisplayValue("#000000"), {
      target: { value: "#123456" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Add Theme" }));

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith({
        name: "Ocean Blue",
        hex: "#123456",
      });
    });
  });
});
