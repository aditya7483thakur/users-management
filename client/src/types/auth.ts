// types/auth.ts
export interface LoginData {
  email: string;
  password: string;
  captchaId: string;
  captchaAnswer: number;
}
export interface RegisterData {
  name: string;
  email: string;
  captchaId: string;
  captchaAnswer: number;
}

export interface SetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface UpdateProfileData {
  email?: string;
  name?: string;
}

export interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangeThemeData {
  theme: string;
}

// types/api.ts
export interface ApiResponse<T> {
  ok: boolean;
  data: T | null; // null means "no data"
  message: string;
  error?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}
