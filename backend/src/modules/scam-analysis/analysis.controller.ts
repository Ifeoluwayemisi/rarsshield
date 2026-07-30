import { Response, Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { AnalysisService } from "../../services/AnalysisService";

const router = Router();
const analysisService = new AnalysisService();

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const analysis = await analysisService.createAnalysis(req.userId!, req.body);
  res.status(201).json({ success: true, data: analysis });
});

export default router;
