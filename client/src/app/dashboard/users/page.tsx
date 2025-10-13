"use client";
import { Trash2, Mail } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteUserAPI, getAllUsersAPI } from "@/services/auth";
import { useThemeStore } from "@/providers/store";

const modalStyles = {
  backgroundColor: "var(--bg)",
  color: "var(--text)",
  borderColor: "var(--text)",
};

export default function Page() {
  const { email: currentEmail } = useThemeStore();
  const getAllUsersMutate = useQuery({
    queryKey: ["allUsers"],
    queryFn: getAllUsersAPI,
  });

  const deleteUserMutate = useMutation({
    mutationFn: deleteUserAPI,
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (err: Error) => {
      console.log("console", err);
      toast.error(err.message);
    },
  });

  const handleDelete = (id: string) => {
    deleteUserMutate.mutate(id);
  };

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
            {getAllUsersMutate?.data?.length === 0 ? (
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
                        onClick={() => handleDelete(user._id)}
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
    </section>
  );
}
