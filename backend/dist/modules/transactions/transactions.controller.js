"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const TransactionService_1 = require("../../services/TransactionService");
const router = (0, express_1.Router)();
const transactionService = new TransactionService_1.TransactionService();
router.post("/", auth_1.authenticate, async (req, res) => {
    const transaction = await transactionService.createTransaction(req.userId, req.body);
    res.status(201).json({ success: true, data: transaction });
});
router.get("/balance", auth_1.authenticate, async (req, res) => {
    const balance = await transactionService.getBalance(req.userId);
    res.json({ success: true, data: balance });
});
router.get("/", auth_1.authenticate, async (req, res) => {
    const history = await transactionService.getHistory(req.userId);
    res.json({ success: true, data: history });
});
exports.default = router;
//# sourceMappingURL=transactions.controller.js.map