"use client";

import { useReducer } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPasswordAPI, loginUserAPI } from "@/services/auth";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";
import PasswordInput from "@/components/PasswordInput";

type State = {
  email: string;
  password: string;
  isForgotModalOpen: boolean;
  forgotEmail: string;
};

type Action =
  | { type: "SET_EMAIL"; payload: string }
  | { type: "SET_PASSWORD"; payload: string }
  | { type: "OPEN_FORGOT_MODAL" }
  | { type: "CLOSE_FORGOT_MODAL" }
  | { type: "SET_FORGOT_EMAIL"; payload: string }
  | { type: "RESET_FORGOT_EMAIL" }
  | { type: "RESET_LOGIN" };

const initialState: State = {
  email: "",
  password: "",
  isForgotModalOpen: false,
  forgotEmail: "",
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_EMAIL":
      return { ...state, email: action.payload };
    case "SET_PASSWORD":
      return { ...state, password: action.payload };
    case "OPEN_FORGOT_MODAL":
      return { ...state, isForgotModalOpen: true };
    case "CLOSE_FORGOT_MODAL":
      return { ...state, isForgotModalOpen: false };
    case "SET_FORGOT_EMAIL":
      return { ...state, forgotEmail: action.payload };
    case "RESET_FORGOT_EMAIL":
      return { ...state, forgotEmail: "" };
    case "RESET_LOGIN":
      return { ...state, email: "", password: "" };
    default:
      return state;
  }
}

export default function LoginPage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  const loginMutate = useMutation({
    mutationFn: loginUserAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      dispatch({ type: "RESET_LOGIN" });
      router.push("/dashboard");
    },
    onError: (err: Error) => {
      console.log("console", err);
      toast.error(err.message);
    },
  });

  const forgotPasswordMutate = useMutation({
    mutationFn: forgotPasswordAPI,
    onSuccess: (data) => {
      toast.success(data.message);
      dispatch({ type: "RESET_FORGOT_EMAIL" });
      dispatch({ type: "CLOSE_FORGOT_MODAL" });
    },
    onError: (err: Error) => {
      console.log("console", err);
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutate.mutate({ email: state.email, password: state.password });
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.forgotEmail.trim()) {
      toast.error("Please enter your email address.");
      return;
    }

    forgotPasswordMutate.mutate({ email: state.forgotEmail });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md relative">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-800">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={state.email}
              onChange={(e) =>
                dispatch({ type: "SET_EMAIL", payload: e.target.value })
              }
              required
              placeholder="Enter your email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <PasswordInput
              label="Password"
              value={state.password}
              onChange={(e) =>
                dispatch({ type: "SET_PASSWORD", payload: e.target.value })
              }
              placeholder="Enter your password"
              required
              name="Password"
            />
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => dispatch({ type: "OPEN_FORGOT_MODAL" })}
              className="text-sm text-blue-600 hover:underline hover:cursor-pointer"
            >
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className={`w-full bg-blue-600 text-white hover:cursor-pointer py-2 rounded-lg transition ${
              loginMutate.isPending
                ? "opacity-70 cursor-not-allowed"
                : "hover:bg-blue-700"
            }`}
            disabled={loginMutate.isPending}
          >
            {loginMutate.isPending ? "Logging..." : "Login"}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={state.isForgotModalOpen}
        onClose={() => dispatch({ type: "CLOSE_FORGOT_MODAL" })}
      >
        <h2 className="text-lg font-semibold mb-4">Reset your password</h2>
        <form onSubmit={handleForgotSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={state.forgotEmail}
              onChange={(e) =>
                dispatch({ type: "SET_FORGOT_EMAIL", payload: e.target.value })
              }
              required
              placeholder="Enter your email address"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => dispatch({ type: "CLOSE_FORGOT_MODAL" })}
              className="px-4 py-2 border hover:cursor-pointer rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:cursor-pointer text-white rounded-lg text-sm hover:bg-blue-700 transition"
              disabled={forgotPasswordMutate.isPending}
            >
              {forgotPasswordMutate.isPending
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
