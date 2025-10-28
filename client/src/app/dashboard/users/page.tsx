"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Trash2, Mail, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";
import {
  deleteUserAPI,
  getAllUsersAPI,
  wrapperFunction,
} from "@/services/auth";
import { useThemeStore } from "@/providers/store";
import Modal from "@/components/Modal";
import { ApiResponse, User } from "@/types/auth";

export default function Page() {
  const { email: currentEmail } = useThemeStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [timer, setTimer] = useState<number>(10);

  const resetTimer = () => setTimer(10);

  // Infinite query
  const getAllUsersQuery = useInfiniteQuery<
    ApiResponse<User[]>, // TData
    Error, // TError
    ApiResponse<User[]>, // TInfiniteData
    string[], // TQueryKey
    string | undefined // TPageParam (cursor)
  >({
    queryKey: ["users"],
    queryFn: ({ pageParam }) =>
      wrapperFunction(() => getAllUsersAPI(10, pageParam), 10, 1000),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.data && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    retry: 0,
  });

  // Combine all users into a single arrayconst users: User[]
  const users: User[] =
    (
      getAllUsersQuery.data as InfiniteData<ApiResponse<User[]>> | undefined
    )?.pages
      .filter((page) => page.data) // only keep pages with data
      .flatMap((page) => page.data!) ?? [];

  // Delete user mutation
  const deleteUserMutate = useMutation({
    mutationFn: deleteUserAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      setIsModalOpen(false);
      setSelectedUserId(null);
      getAllUsersQuery.refetch();
      resetTimer();
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Auto-refresh timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) {
          getAllUsersQuery.refetch();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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

  const handleManualRefresh = () => {
    getAllUsersQuery.refetch();
    resetTimer();
  };

  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (getAllUsersQuery.isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && getAllUsersQuery.hasNextPage) {
          getAllUsersQuery.fetchNextPage();
        }
      });

      if (node) observer.current.observe(node);
    },
    [getAllUsersQuery.isFetchingNextPage, getAllUsersQuery.hasNextPage]
  );

  // Loader
  if (getAllUsersQuery.isLoading) {
    return (
      <section className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-3" />
        <p className="text-gray-600 font-medium animate-pulse">
          Loading users...
        </p>
      </section>
    );
  }

  if (getAllUsersQuery.isError) {
    return (
      <section className="flex flex-col items-center justify-center h-[70vh]">
        <p className="text-red-600 font-bold text-2xl animate-pulse">
          An error occured!
        </p>
      </section>
    );
  }

  return (
    <section className="p-6 space-y-6">
      <div className="flex justify-between mb-4 items-center">
        <h2 className="text-3xl font-semibold tracking-tight">Users</h2>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Refresh in: {timer}s</span>
          <button
            onClick={handleManualRefresh}
            className="px-4 py-1 rounded-lg border border-gray-400 hover:bg-gray-100 transition hover:cursor-pointer"
            style={{
              backgroundColor: "var(--foreground)",
              color: "var(--background)",
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl shadow-md border border-opacity-20 max-h-[70vh] overflow-y-auto">
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
            {users.map((user, idx) => {
              const isLastUser = idx === users.length - 1;
              return (
                <tr
                  ref={isLastUser ? lastUserRef : null}
                  key={user._id}
                  className="transition-colors hover:bg-[color-mix(in_srgb,var(--bg)_85%,var(--text)_10%)]"
                >
                  <td className="py-4 px-6 flex items-center gap-2">
                    <Mail size={16} className="opacity-70" />
                    <span>{user.email}</span>
                  </td>
                  <td className="text-right py-4 px-6">
                    {user.email !== currentEmail && (
                      <button
                        onClick={() => openDeleteModal(user._id)}
                        className="inline-flex items-center gap-2 text-sm font-medium border hover:cursor-pointer px-3 py-1.5 rounded-xl transition-all duration-200 hover:scale-[1.05]"
                        style={{
                          backgroundColor: "var(--foreground)",
                          color: "var(--background)",
                        }}
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {getAllUsersQuery.isFetchingNextPage && (
              <tr>
                <td colSpan={2} className="py-4 px-6 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </td>
              </tr>
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
            className="px-4 py-2 rounded-lg border border-gray-400 hover:cursor-pointer hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleteUserMutate.isPending}
            className={`px-4 py-2 rounded-lg hover:cursor-pointer text-white transition-all ${
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
