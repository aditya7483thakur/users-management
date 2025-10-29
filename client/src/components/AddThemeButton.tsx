"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCustomThemeAPI } from "@/services/auth";
import { addCustomThemeSchema } from "@/lib/schemas";

export default function AddThemeButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [hex, setHex] = useState("#000000");
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: addCustomThemeAPI,
    onSuccess: () => {
      toast.success("Theme added successfully!");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsOpen(false);
      setName("");
      setHex("#ffffff");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = addCustomThemeSchema.safeParse({ name, hex });
    if (!validation.success) {
      const firstError = validation.error.issues[0]?.message;
      return toast.error(firstError || "Invalid input");
    }

    // If validation passes
    mutate(validation.data);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 hover:cursor-pointer rounded-lg hover:opacity-80 transition"
        style={{
          backgroundColor: "var(--foreground)",
          color: "var(--background)",
        }}
      >
        + Add Theme
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setName("");
          setHex("#000000");
        }}
      >
        <h3 className="text-xl font-semibold mb-4">Add Custom Theme</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="e.g. Ocean Blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Hex Code</label>
            <input
              type="color"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-full h-10 p-1 border rounded cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-black text-white py-2 rounded-lg hover:opacity-80 transition hover:cursor-pointer"
          >
            {isPending ? "Adding..." : "Add Theme"}
          </button>
        </form>
      </Modal>
    </>
  );
}
