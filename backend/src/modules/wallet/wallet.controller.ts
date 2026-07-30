import { Response, Router } from "express";
import { authenticate, AuthRequest } from "../../middlewares/auth";
import { BMONIService } from "../../integrations/bmoni/BMONIService";
import { WalletService } from "../../integrations/bmoni/services/wallet.service";

const router = Router();
const bmoniService = new BMONIService();
const walletService = new WalletService();

router.post("/sync", authenticate, async (req: AuthRequest, res: Response) => {
  const wallet = await bmoniService.syncWallet(req.userId!);
  res.json({ success: true, data: wallet });
});

router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  const wallet = await bmoniService.getWallet(req.userId!);
  res.json({ success: true, data: wallet });
});

router.get("/info", authenticate, async (_req: AuthRequest, res: Response) => {
  const info = await walletService.getHealth();
  res.json({ success: true, data: info });
});

router.get(
  "/summary",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const summary = await walletService.getWalletSummary(req.userId!);
    res.json({ success: true, data: summary });
  },
);

router.post(
  "/owner-proof-challenge",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const result = await bmoniService.createOwnerProofChallenge(
      req.userId!,
      req.body ?? {},
    );
    res.json({ success: true, data: result });
  },
);

router.get(
  "/onboarding/status",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const status = await bmoniService.getOnboardingStatus(req.userId!);
    res.json({ success: true, data: status });
  },
);

router.post(
  "/onboarding/start-nigeria",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const result = await bmoniService.startNigeriaOnboarding(
      req.userId!,
      req.body ?? {},
    );
    res.json({ success: true, data: result });
  },
);

router.get(
  "/wallets",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const wallets = await bmoniService.getWallets(req.userId!);
    res.json({ success: true, data: wallets });
  },
);

router.get(
  "/balance",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const balance = await walletService.getBalance(req.userId!);
    res.json({ success: true, data: balance });
  },
);

router.get(
  "/transactions",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const transactions = await bmoniService.getTransactions(req.userId!);
    res.json({ success: true, data: transactions });
  },
);

router.post(
  "/onboard",
  authenticate,
  async (req: AuthRequest, res: Response) => {
    const result = await bmoniService.onboardUser(req.userId!, req.body ?? {});
    res.json({ success: true, data: result });
  },
);

export default router;
