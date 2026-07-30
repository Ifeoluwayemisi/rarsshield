"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
class EmailService {
    transporter = nodemailer_1.default.createTransport({
        host: config_1.default.email.smtpHost,
        port: config_1.default.email.smtpPort,
        secure: false,
        auth: config_1.default.email.smtpUser && config_1.default.email.smtpPassword
            ? {
                user: config_1.default.email.smtpUser,
                password: config_1.default.email.smtpPassword,
            }
            : undefined,
    });
    async sendMail(to, subject, html) {
        if (!config_1.default.email.smtpHost || !config_1.default.email.smtpUser || !config_1.default.email.smtpPassword) {
            return { ok: false, reason: "smtp_not_configured" };
        }
        await this.transporter.sendMail({
            from: config_1.default.email.from,
            to,
            subject,
            html,
        });
        return { ok: true };
    }
}
exports.EmailService = EmailService;
//# sourceMappingURL=EmailService.js.map