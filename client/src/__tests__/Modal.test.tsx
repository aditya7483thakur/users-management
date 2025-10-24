import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Modal from "@/components/Modal";

describe("Modal Component", () => {
  it("renders children when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    // Check that the content is rendered
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>
    );

    // Should not find the content
    expect(screen.queryByText("Modal Content")).toBeNull();
  });
});
