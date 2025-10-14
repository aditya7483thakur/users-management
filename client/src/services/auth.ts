import axios from "axios";
import {
  ChangePasswordData,
  ChangeThemeData,
  ForgotPasswordData,
  LoginData,
  RegisterData,
  SetPasswordData,
  UpdateProfileData,
} from "@/types/auth";
import axiosInstance from "@/utils/axiosInstance";

// Register new user
export async function registerUserAPI(data: RegisterData) {
  try {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message ||
        "Something went wrong during registration";
      throw new Error(errorMessage);
    } else {
      throw new Error("Registration failed");
    }
  }
}

// Login user
export async function loginUserAPI(data: LoginData) {
  try {
    const res = await axiosInstance.post("/auth/login", data);
    const responseData = res.data;
    if (responseData.token) {
      localStorage.setItem("token", responseData.token);
    }
    return responseData;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Something went wrong during login";
      throw new Error(errorMessage);
    } else {
      throw new Error("Login failed");
    }
  }
}

// Forgot Password
export async function forgotPasswordAPI(data: ForgotPasswordData) {
  try {
    const res = await axiosInstance.post("/auth/forgot-password", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to send password reset email";
      throw new Error(errorMessage);
    } else {
      throw new Error("Email sending for password reset failed");
    }
  }
}

// Set Password
export async function setPasswordAPI(data: SetPasswordData) {
  try {
    const res = await axiosInstance.post("/auth/set-password", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to set new password";
      throw new Error(errorMessage);
    } else {
      throw new Error("Password reset failed");
    }
  }
}

// get Profile
export async function getProfileAPI() {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to fetch profile";
      throw new Error(errorMessage);
    } else {
      throw new Error("Profile fetching failed");
    }
  }
}

// update profile
export async function updateProfileAPI(data: UpdateProfileData) {
  try {
    const res = await axiosInstance.patch("/auth/me", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile";
      throw new Error(errorMessage);
    } else {
      throw new Error("Profile update failed");
    }
  }
}

// update password
export async function updatePasswordAPI(data: ChangePasswordData) {
  try {
    const res = await axiosInstance.patch("/auth/update-password", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to update profile";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to update profile");
    }
  }
}

export async function logoutAPI() {
  try {
    const res = await axiosInstance.patch("/auth/logout");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage = err.response?.data?.message || "Failed to logout";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to logout");
    }
  }
}

export async function getAllUsersAPI() {
  try {
    const res = await axiosInstance.get("/auth");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to get profiles";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to get profiles");
    }
  }
}

export async function deleteMeAPI() {
  try {
    const res = await axiosInstance.delete("/auth/me");
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete profile";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to delete profile");
    }
  }
}

export async function deleteUserAPI(userId: string) {
  try {
    const res = await axiosInstance.delete(`/auth/${userId}`);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to delete user";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to delete user");
    }
  }
}

export async function changeThemeAPI(data: ChangeThemeData) {
  try {
    const res = await axiosInstance.patch("/auth/theme", data);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to change theme";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to change theme");
    }
  }
}
