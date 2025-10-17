"use client";

import { useReducer } from "react";
import { useThemeStore } from "@/providers/store";
import Modal from "@/components/Modal";
import { useMutation } from "@tanstack/react-query";
import {
  deleteMeAPI,
  updatePasswordAPI,
  updateProfileAPI,
} from "@/services/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import PasswordInput from "@/components/PasswordInput";

type State = {
  name: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
  isModalOpen: boolean;
  showOldPassword: boolean;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
};

type Action =
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_OLD_PASSWORD"; payload: string }
  | { type: "SET_NEW_PASSWORD"; payload: string }
  | { type: "SET_CONFIRM_PASSWORD"; payload: string }
  | { type: "SET_MODAL_OPEN"; payload: boolean }
  | { type: "TOGGLE_SHOW_OLD_PASSWORD" }
  | { type: "TOGGLE_SHOW_NEW_PASSWORD" }
  | { type: "TOGGLE_SHOW_CONFIRM_PASSWORD" }
  | { type: "RESET_PASSWORD_FIELDS" }
  | { type: "RESET_NAME_EMAIL" };

const initialState: State = {
  name: "",
  email: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
  isModalOpen: false,
  showOldPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.payload };
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_OLD_PASSWORD":
      return { ...state, oldPassword: action.payload };
    case "SET_NEW_PASSWORD":
      return { ...state, newPassword: action.payload };
    case "SET_CONFIRM_PASSWORD":
      return { ...state, confirmPassword: action.payload };
    case "SET_MODAL_OPEN":
      return { ...state, isModalOpen: action.payload };
    case "TOGGLE_SHOW_OLD_PASSWORD":
      return { ...state, showOldPassword: !state.showOldPassword };
    case "TOGGLE_SHOW_NEW_PASSWORD":
      return { ...state, showNewPassword: !state.showNewPassword };
    case "TOGGLE_SHOW_CONFIRM_PASSWORD":
      return { ...state, showConfirmPassword: !state.showConfirmPassword };
    case "RESET_PASSWORD_FIELDS":
      return {
        ...state,
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      };
    case "RESET_NAME_EMAIL":
      return { ...state, name: "", email: "" };
    default:
      return state;
  }
}

export default function ProfilePage() {
  const { theme, setUser } = useThemeStore();
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  const profileMutation = useMutation({
    mutationFn: updateProfileAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      dispatch({ type: "RESET_NAME_EMAIL" });
      setUser({ name: data.user.name });
    },
    onError: (err: Error) => {
      console.log(err);
      toast.error(err.message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: updatePasswordAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      dispatch({ type: "RESET_PASSWORD_FIELDS" });
      dispatch({ type: "SET_MODAL_OPEN", payload: false });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMeAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      router.push("/login");
      localStorage.removeItem("token");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const handleSaveChanges = () => {
    const payload: {
      name?: string;
      email?: string;
    } = {
      name: state.name.trim(),
      email: state.email.trim(),
    };

    // remove empty fields
    if (!payload.name) delete payload.name;
    if (!payload.email) delete payload.email;

    if (Object.keys(payload).length === 0) {
      toast.error("Please provide at least one field to update.");
      return;
    }

    profileMutation.mutate(payload);
  };

  const handleChangePasswordSubmit = () => {
    passwordMutation.mutate({
      oldPassword: state.oldPassword,
      newPassword: state.newPassword,
      confirmPassword: state.confirmPassword,
    });
  };

  const handleDeleteAccount = () => {
    deleteMutation.mutate();
  };

  return (
    <div
      className={`max-w-md mx-auto mt-10 p-6 rounded-lg shadow-md theme-${theme}`}
      style={{ backgroundColor: "var(--bg)", color: "var(--text)" }}
    >
      <h1 className="text-2xl font-semibold mb-6">Profile Settings</h1>

      {/* Name Input */}
      <div className="mb-4">
        <label className="block mb-1 font-medium">Name</label>
        <input
          type="text"
          value={state.name}
          onChange={(e) =>
            dispatch({ type: "SET_NAME", payload: e.target.value })
          }
          placeholder="Enter your name"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--text)",
            backgroundColor: "var(--bg)",
            color: "var(--text)",
          }}
        />
      </div>

      {/* Email Input */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">Email</label>
        <input
          type="email"
          value={state.email}
          onChange={(e) =>
            dispatch({ type: "SET_EMAIL", payload: e.target.value })
          }
          placeholder="Enter your email"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
          style={{
            borderColor: "var(--text)",
            backgroundColor: "var(--bg)",
            color: "var(--text)",
          }}
        />
      </div>

      {/* Buttons */}
      <button
        onClick={handleSaveChanges}
        className="w-full py-2 rounded-lg mb-4 transition-colors hover:cursor-pointer"
        style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
      >
        Save Changes
      </button>

      <button
        onClick={() => dispatch({ type: "SET_MODAL_OPEN", payload: true })}
        className="w-full py-2 rounded-lg mb-4 transition-colors hover:cursor-pointer"
        style={{
          backgroundColor: "var(--bg)",
          color: "var(--text)",
          border: "1px solid var(--text)",
        }}
      >
        Change Password
      </button>

      <button
        onClick={handleDeleteAccount}
        className="w-full py-2 rounded-lg transition-colors hover:cursor-pointer"
        style={{ backgroundColor: "#b91c1c", color: "#fee2e2" }}
      >
        Delete Account
      </button>

      {/* Modal */}
      <Modal
        isOpen={state.isModalOpen}
        onClose={() => dispatch({ type: "SET_MODAL_OPEN", payload: false })}
      >
        <h2 className="text-xl font-semibold mb-4 space-y-2">
          Change Password
        </h2>

        <div className="flex flex-col gap-3">
          <PasswordInput
            label="Old Password"
            value={state.oldPassword}
            onChange={(e) =>
              dispatch({ type: "SET_OLD_PASSWORD", payload: e.target.value })
            }
            placeholder="Old Password"
            required
            name="oldPassword"
          />

          <PasswordInput
            label="New Password"
            value={state.newPassword}
            onChange={(e) =>
              dispatch({ type: "SET_NEW_PASSWORD", payload: e.target.value })
            }
            placeholder="New Password"
            required
            name="newPassword"
          />

          <PasswordInput
            label="Confirm New Password"
            value={state.confirmPassword}
            onChange={(e) =>
              dispatch({
                type: "SET_CONFIRM_PASSWORD",
                payload: e.target.value,
              })
            }
            placeholder="Confirm New Password"
            required
            name="confirmNewPassword"
          />
        </div>

        <div className="flex justify-end mt-4 gap-2">
          <button
            onClick={() => dispatch({ type: "SET_MODAL_OPEN", payload: false })}
            className="px-4 py-2 rounded-lg hover:cursor-pointer"
            style={{ backgroundColor: "var(--text)", color: "var(--bg)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleChangePasswordSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:cursor-pointer"
          >
            Submit
          </button>
        </div>
      </Modal>
    </div>
  );
}
