import nodemailer from "nodemailer";
import config from "../config";

export class EmailService {
  private transporter = (() => {
    // Gmail shortcut – let Nodemailer handle the service configuration
    if (config.email.smtpHost && config.email.smtpHost.includes('gmail.com')) {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.email.smtpUser,
          pass: config.email.smtpPassword,
        },
      });
    }
    // Default SMTP configuration (including custom host/port)
    return nodemailer.createTransport({
      host: config.email.smtpHost,
      port: config.email.smtpPort,
      // Use secure connection for SSL ports (e.g., Gmail SMTP on 465)
      secure: config.email.smtpPort === 465,
      auth:
        config.email.smtpUser && config.email.smtpPassword
          ? {
              user: config.email.smtpUser,
              pass: config.email.smtpPassword,
            }
          : undefined,
    });
  })();

  async sendMail(to: string, subject: string, html: string) {
    if (!config.email.smtpHost || config.email.smtpHost.includes('example.com') || !config.email.smtpUser || !config.email.smtpPassword) {
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
