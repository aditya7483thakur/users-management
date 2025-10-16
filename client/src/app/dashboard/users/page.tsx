"use client";

import { useState } from "react";
import { Trash2, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteUserAPI,
  getAllUsersAPI,
  wrapperFunction,
} from "@/services/auth";
import { useThemeStore } from "@/providers/store";
import Modal from "@/components/Modal";
import { get } from "http";
import { User } from "@/types/auth";

const modalStyles = {
  backgroundColor: "var(--bg)",
  color: "var(--text)",
  borderColor: "var(--text)",
};

export default function Page() {
  const { email: currentEmail } = useThemeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Fetch all users
  const getAllUsersMutate = useQuery<User[] | null>({
    queryKey: ["allUsers"],
    queryFn: () => wrapperFunction(getAllUsersAPI, 10, 500),
    refetchInterval: 1000 * 60 * 5, // every 5 mins
    retry: 0,
  });

  // Delete user by ID
  const deleteUserMutate = useMutation({
    mutationFn: deleteUserAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      setIsModalOpen(false);
      setSelectedUserId(null);
      getAllUsersMutate.refetch();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const openDeleteModal = (id: string) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      deleteUserMutate.mutate(selectedUserId);
    }
  };

  const cancelDelete = () => {
    setSelectedUserId(null);
    setIsModalOpen(false);
  };

  // 💡 Loader UI
  if (getAllUsersMutate.isLoading) {
    return (
      <section className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600 font-medium animate-pulse">
          Loading users...
        </p>
      </section>
    );
  }

  if (getAllUsersMutate.isError) {
    return (
      <section className="flex flex-col items-center justify-center h-[70vh]">
        <p className="text-red-600 font-bold text-2xl animate-pulse">
          An error occured !
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6" style={modalStyles}>
      <h2 className="text-3xl font-semibold mb-4 tracking-tight">Users</h2>

      <div
        className="overflow-x-auto rounded-2xl shadow-md border border-opacity-20"
        style={modalStyles}
      >
        <table className="min-w-full text-sm">
          <thead>
            <tr
              className="border-b text-left uppercase text-xs tracking-wider"
              style={{ borderColor: "var(--text)" }}
            >
              <th className="py-3 px-6 font-semibold">Email</th>
              <th className="py-3 px-6 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!getAllUsersMutate?.data || getAllUsersMutate.data.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-6 opacity-70 text-sm">
                  No users found
                </td>
              </tr>
            ) : (
              getAllUsersMutate?.data
                ?.filter(
                  (user: { _id: string; email: string }) =>
                    user.email !== currentEmail
                )
                .map((user: { _id: string; email: string }) => (
                  <tr
                    key={user._id}
                    className={`transition-colors hover:bg-[color-mix(in_srgb,var(--bg)_85%,var(--text)_10%)]`}
                  >
                    <td className="py-4 px-6 flex items-center gap-2">
                      <Mail size={16} className="opacity-70" />
                      <span>{user.email}</span>
                    </td>
                    <td className="text-right py-4 px-6">
                      <button
                        onClick={() => openDeleteModal(user._id)}
                        className="inline-flex items-center gap-2 text-sm font-medium border px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-[1.05]"
                        style={{
                          borderColor: "var(--primary,#2679f3)",
                          color: "var(--primary,#2679f3)",
                        }}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={cancelDelete}>
        <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
        <p className="mb-6">Are you sure you want to delete this user?</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={cancelDelete}
            className="px-4 py-2 rounded-lg border border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleteUserMutate.isPending}
            className={`px-4 py-2 rounded-lg text-white transition-all ${
              deleteUserMutate.isPending
                ? "bg-red-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {deleteUserMutate.isPending ? "Deleting..." : "Confirm"}
          </button>
        </div>
      </Modal>
    </section>
  );
}
