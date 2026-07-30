import { Request, Response, Router } from "express";
import { AuthService } from "../../services/AuthService";
import {
  validateSignup,
  validateLogin,
  validateRefresh,
  validateLogout,
  validateForgotPassword,
  validateResetPassword,
  validateVerifyEmail,
} from "../../validators/auth.validator";

const authService = new AuthService();
const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  const data = validateSignup(req.body);
  const result = await authService.signup(data);
  res.status(201).json({ success: true, data: result });
});

router.post("/login", async (req: Request, res: Response) => {
  const data = validateLogin(req.body);
  const result = await authService.login(data);
  res.json({ success: true, data: result });
});

router.post("/forgot-password", async (req: Request, res: Response) => {
  const data = validateForgotPassword(req.body);
  const result = await authService.forgotPassword(data);
  res.json({ success: true, data: result });
});

router.get("/verify-email", async (req: Request, res: Response) => {
  const token = req.query.token;
  if (typeof token !== "string" || !token) {
    res.status(400).send("Missing verification token");
    return;
  }

  await authService.verifyEmail(token);
  res
    .type("html")
    .send(
      "<html><body><h2>Email verified successfully</h2><p>You can now return to the app.</p></body></html>",
    );
});

router.post("/verify-email", async (req: Request, res: Response) => {
  const data = validateVerifyEmail(req.body);
  const result = await authService.verifyEmail(data.token);
  res.json({ success: true, data: result });
});

router.get("/reset-password", async (req: Request, res: Response) => {
  const token = req.query.token;
  if (typeof token !== "string" || !token) {
    res.status(400).send("Missing reset token");
    return;
  }

  res.type("html").send(`
    <html>
      <body>
        <h2>Reset your password</h2>
        <form method="POST" action="/api/auth/reset-password">
          <input type="hidden" name="token" value="${token}" />
          <input type="password" name="password" placeholder="New password" required />
          <button type="submit">Reset password</button>
        </form>
      </body>
    </html>
  `);
});

router.post("/reset-password", async (req: Request, res: Response) => {
  const data = validateResetPassword(req.body);
  const result = await authService.resetPassword(data);
  res.json({ success: true, data: result });
});

router.post("/refresh", async (req: Request, res: Response) => {
  const data = validateRefresh(req.body);
  const tokens = await authService.refreshToken(data.refreshToken);
  res.json({ success: true, data: tokens });
});

router.post("/logout", async (req: Request, res: Response) => {
  const data = validateLogout(req.body);
  await authService.logout(data.refreshToken);
  res.json({ success: true });
});

export default router;
