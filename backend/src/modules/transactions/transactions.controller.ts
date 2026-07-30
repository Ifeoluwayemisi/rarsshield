import { Response, Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { TransactionService } from "../../services/TransactionService";

const router = Router();
const transactionService = new TransactionService();

router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
  const transaction = await transactionService.createTransaction(
    req.userId!,
    req.body,
  );
  res.status(201).json({ success: true, data: transaction });
});

router.get(
  "/balance",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const balance = await transactionService.getBalance(req.userId!);
    res.json({ success: true, data: balance });
  },
);

router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
  const history = await transactionService.getHistory(req.userId!);
  res.json({ success: true, data: history });
});

export default router;
