import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { SettingsService } from "../../services/SettingsService";

const router = Router();
const service = new SettingsService();

// GET /api/settings
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const settings = await service.getSettings(req.userId!);
  res.json({ success: true, data: settings });
});

// PUT /api/settings
router.put("/", authenticate, async (req: AuthRequest, res: Response) => {
  const { notificationEmail, notificationSms, privacyMode } = req.body;
  const updated = await service.updateSettings(req.userId!, {
    notificationEmail,
    notificationSms,
    privacyMode,
  });
  res.json({ success: true, data: updated });
});

export default router;
