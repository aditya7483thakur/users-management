import axios from "axios";
import {
  ApiResponse,
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
    const encodedPassword = btoa(data.password);
    const res = await axiosInstance.post("/auth/login", {
      ...data,
      password: encodedPassword,
    });

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
    const res = await axiosInstance.post("/user/forgot-password", data);
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
    const encodedPassword = btoa(data.password);
    const encodedConfirmPassword = btoa(data.confirmPassword);
    const res = await axiosInstance.post(
      `/user/set-password?token=${data.token}`,
      {
        password: encodedPassword,
        confirmPassword: encodedConfirmPassword,
      }
    );
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
    const res = await axiosInstance.get("/user/me");
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
    const res = await axiosInstance.patch("/user/me", data);
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
    const encodedData = {
      ...data,
      oldPassword: btoa(data.oldPassword),
      newPassword: btoa(data.newPassword),
      confirmPassword: btoa(data.confirmPassword),
    };

    const res = await axiosInstance.patch("/user/update-password", encodedData);
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

// logout
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

// get all users
export async function getAllUsersAPI() {
  try {
    const res = await axiosInstance.get("/user");
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

// delete my account
export async function deleteMeAPI() {
  try {
    const res = await axiosInstance.delete("/user/me");
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

//delete someone else account
export async function deleteUserAPI(userId: string) {
  try {
    const res = await axiosInstance.delete(`/user/${userId}`);
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

// change theme
export async function changeThemeAPI(data: ChangeThemeData) {
  try {
    const res = await axiosInstance.patch("/theme/change", data);
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

// verify email
export async function verifyEmailAPI(token: string) {
  try {
    const res = await axiosInstance.patch(`/user/verify-email?token=${token}`);
    return res.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const errorMessage =
        err.response?.data?.message || "Failed to update email";
      throw new Error(errorMessage);
    } else {
      throw new Error("Failed to update email");
    }
  }
}

// -------------------------
// Wrapper function (infra retry example)
// -------------------------
// Generic async GET request wrapper

export async function wrapperFunction<T>(
  reqFn: () => Promise<ApiResponse<T>>,
  attempts = 3,
  wait = 1000
): Promise<T> {
  let lastError: unknown = null;

  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await reqFn();

      if (res.ok && res.data !== null) {
        console.log(`✅ Success on attempt ${i}`);
        return res.data;
      }

      lastError = res.error || "No data";
      console.warn(`❌ Attempt ${i} failed: ${lastError}`);
    } catch (err) {
      lastError = err;
      console.warn(`❌ Attempt ${i} threw error: ${(err as Error).message}`);
    }

    if (i < attempts) {
      await delay(wait);
    }
  }

  throw new Error(JSON.stringify(lastError));
}

// Utility delay function
async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, Math.min(ms, 10000)));
}
