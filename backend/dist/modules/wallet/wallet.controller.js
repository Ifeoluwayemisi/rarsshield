"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const BMONIService_1 = require("../../integrations/bmoni/BMONIService");
const wallet_service_1 = require("../../integrations/bmoni/services/wallet.service");
const router = (0, express_1.Router)();
const bmoniService = new BMONIService_1.BMONIService();
const walletService = new wallet_service_1.WalletService();
router.post("/sync", auth_1.authenticate, async (req, res) => {
    const wallet = await bmoniService.syncWallet(req.userId);
    res.json({ success: true, data: wallet });
});
router.get("/me", auth_1.authenticate, async (req, res) => {
    const wallet = await bmoniService.getWallet(req.userId);
    res.json({ success: true, data: wallet });
});
router.get("/info", auth_1.authenticate, async (_req, res) => {
    const info = await walletService.getHealth();
    res.json({ success: true, data: info });
});
router.get("/summary", auth_1.authenticate, async (req, res) => {
    const summary = await walletService.getWalletSummary(req.userId);
    res.json({ success: true, data: summary });
});
router.post("/owner-proof-challenge", auth_1.authenticate, async (req, res) => {
    const result = await bmoniService.createOwnerProofChallenge(req.userId, req.body ?? {});
    res.json({ success: true, data: result });
});
router.get("/onboarding/status", auth_1.authenticate, async (req, res) => {
    const status = await bmoniService.getOnboardingStatus(req.userId);
    res.json({ success: true, data: status });
});
router.post("/onboarding/start-nigeria", auth_1.authenticate, async (req, res) => {
    const result = await bmoniService.startNigeriaOnboarding(req.userId, req.body ?? {});
    res.json({ success: true, data: result });
});
router.get("/wallets", auth_1.authenticate, async (req, res) => {
    const wallets = await bmoniService.getWallets(req.userId);
    res.json({ success: true, data: wallets });
});
router.get("/balance", auth_1.authenticate, async (req, res) => {
    const balance = await walletService.getBalance(req.userId);
    res.json({ success: true, data: balance });
});
router.get("/transactions", auth_1.authenticate, async (req, res) => {
    const transactions = await bmoniService.getTransactions(req.userId);
    res.json({ success: true, data: transactions });
});
router.post("/onboard", auth_1.authenticate, async (req, res) => {
    const result = await bmoniService.onboardUser(req.userId, req.body ?? {});
    res.json({ success: true, data: result });
});
exports.default = router;
//# sourceMappingURL=wallet.controller.js.map