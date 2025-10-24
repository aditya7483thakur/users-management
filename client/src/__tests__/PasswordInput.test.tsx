import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import PasswordInput from "@/components/PasswordInput";

describe("PasswordInput Component", () => {
  it("renders the label if provided", () => {
    render(
      <PasswordInput
        label="Password"
        value=""
        onChange={() => {}}
        placeholder="Enter password"
      />
    );

    expect(screen.getByText("Password")).toBeInTheDocument();
  });

  it("renders input with type password by default", () => {
    render(
      <PasswordInput
        value=""
        onChange={() => {}}
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.type).toBe("password");
  });

  it("toggles input type when eye button is clicked", () => {
    render(
      <PasswordInput
        value=""
        onChange={() => {}}
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText(
      "Enter password"
    ) as HTMLInputElement;
    const button = screen.getByRole("button");

    // Initially password
    expect(input.type).toBe("password");

    // Click to show password
    fireEvent.click(button);
    expect(input.type).toBe("text");

    // Click again to hide password
    fireEvent.click(button);
    expect(input.type).toBe("password");
  });
});
