// types/auth.ts
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
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
