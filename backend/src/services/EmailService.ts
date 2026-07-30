import nodemailer from "nodemailer";
import config from "../config";

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: false,
    auth:
      config.email.smtpUser && config.email.smtpPassword
        ? {
            user: config.email.smtpUser,
            password: config.email.smtpPassword,
          }
        : undefined,
  } as nodemailer.TransportOptions);

  async sendMail(to: string, subject: string, html: string) {
    if (
      !config.email.smtpHost ||
      !config.email.smtpUser ||
      !config.email.smtpPassword
    ) {
      return { ok: false, reason: "smtp_not_configured" };
    }

    await this.transporter.sendMail({
      from: config.email.from,
      to,
      subject,
      html,
    });

    return { ok: true };
  }
}
