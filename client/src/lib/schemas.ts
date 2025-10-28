import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  captchaAnswer: z
    .string()
    .min(1, "Captcha is required")
    .regex(/^\d+$/, "Captcha must be a number"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  email: z.email("Invalid email address"),
  captchaAnswer: z
    .string()
    .min(1, "Captcha is required")
    .regex(/^\d+$/, "Captcha must be a number"),
});

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100)
      .optional(),
    email: z.email("Invalid email address").optional(),
  })
  .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "Please provide at least a name or an email.",
    path: ["name"], // attaches the message to name (you can change this)
  });

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(4, "Old password is required."),
    newPassword: z
      .string()
      .min(4, "Password must be at least 8 characters long."),

    confirmPassword: z.string().min(4, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
  });

export const addCustomThemeSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters long")
    .max(30, "Name must be at most 30 characters long")
    .refine(
      (val) => !["dark", "light", "red"].includes(val.toLowerCase()),
      "Name cannot be 'dark', 'light', or 'red'"
    ),
  hex: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid hex color format"),
});

export type AddThemeSchema = z.infer<typeof addCustomThemeSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;
export type ForgotPasswordSchemaType = z.infer<typeof forgotPasswordSchema>;
