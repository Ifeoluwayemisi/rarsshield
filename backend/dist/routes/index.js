"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = __importDefault(require("../modules/auth/auth.controller"));
const users_controller_1 = __importDefault(require("../modules/users/users.controller"));
const transactions_controller_1 = __importDefault(require("../modules/transactions/transactions.controller"));
const analysis_controller_1 = __importDefault(require("../modules/scam-analysis/analysis.controller"));
const wallet_controller_1 = __importDefault(require("../modules/wallet/wallet.controller"));
const financial_insights_controller_1 = __importDefault(require("../modules/financial-insights/financial-insights.controller"));
const webhooks_controller_1 = __importDefault(require("../modules/webhooks/webhooks.controller"));
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => res.json({ status: "ok", service: "RARS Shield" }));
router.use("/auth", auth_controller_1.default);
router.use("/users", users_controller_1.default);
router.use("/transactions", transactions_controller_1.default);
router.use("/analysis", analysis_controller_1.default);
router.use("/wallet", wallet_controller_1.default);
router.use("/financial-insights", financial_insights_controller_1.default);
router.use("/webhooks", webhooks_controller_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map