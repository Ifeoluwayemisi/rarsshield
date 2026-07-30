import { Response, Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { UserService } from "../../services/UserService";

const router = Router();
const userService = new UserService();

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await userService.getProfile(req.userId!);
  res.json({ success: true, data: user });
});

router.put("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const user = await userService.updateProfile(req.userId!, req.body);
  res.json({ success: true, data: user });
});

export default router;
