import { Response, Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { BMONIService } from "../../integrations/bmoni/BMONIService";

const router = Router();
const bmoniService = new BMONIService();

router.post("/sync", authenticate, async (req: AuthRequest, res: Response) => {
  const insights = await bmoniService.syncInsights(req.userId!);
  res.json({ success: true, data: insights });
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const insights = await bmoniService.getInsights(req.userId!);
  res.json({ success: true, data: insights });
});

export default router;
