"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = validateLogin;
exports.validateSignup = validateSignup;
exports.validateRefresh = validateRefresh;
exports.validateLogout = validateLogout;
exports.validateForgotPassword = validateForgotPassword;
exports.validateResetPassword = validateResetPassword;
exports.validateVerifyEmail = validateVerifyEmail;
const zod_1 = require("zod");
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    name: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
});
const refreshSchema = zod_1.z.object({
    refreshToken: zod_1.z.string().min(1),
});
const logoutSchema = refreshSchema;
const forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
});
const resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
    password: zod_1.z.string().min(8),
});
const verifyEmailSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
function validateLogin(payload) {
    return loginSchema.parse(payload);
}
function validateSignup(payload) {
    return signupSchema.parse(payload);
}
function validateRefresh(payload) {
    return refreshSchema.parse(payload);
}
function validateLogout(payload) {
    return logoutSchema.parse(payload);
}
function validateForgotPassword(payload) {
    return forgotPasswordSchema.parse(payload);
}
function validateResetPassword(payload) {
    return resetPasswordSchema.parse(payload);
}
function validateVerifyEmail(payload) {
    return verifyEmailSchema.parse(payload);
}
//# sourceMappingURL=auth.validator.js.map