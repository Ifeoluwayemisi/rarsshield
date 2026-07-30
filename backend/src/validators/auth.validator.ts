import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const logoutSchema = refreshSchema;

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});


export function validateLogin(payload: unknown) {
  return loginSchema.parse(payload);
}



export function validateSignup(payload: unknown) {
  return signupSchema.parse(payload);
}

export function validateRefresh(payload: unknown) {
  return refreshSchema.parse(payload);
}

export function validateLogout(payload: unknown) {
  return logoutSchema.parse(payload);
}

export function validateForgotPassword(payload: unknown) {
  return forgotPasswordSchema.parse(payload);
}

export function validateResetPassword(payload: unknown) {
  return resetPasswordSchema.parse(payload);
}

export function validateVerifyEmail(payload: unknown) {
  return verifyEmailSchema.parse(payload);
}


