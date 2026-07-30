"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const AnalysisService_1 = require("../../services/AnalysisService");
const router = (0, express_1.Router)();
const analysisService = new AnalysisService_1.AnalysisService();
router.post("/", auth_1.authenticate, async (req, res) => {
    const analysis = await analysisService.createAnalysis(req.userId, req.body);
    res.status(201).json({ success: true, data: analysis });
});
exports.default = router;
//# sourceMappingURL=analysis.controller.js.map