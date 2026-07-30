"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const BMONIService_1 = require("../../integrations/bmoni/BMONIService");
const router = (0, express_1.Router)();
const bmoniService = new BMONIService_1.BMONIService();
router.post("/sync", auth_1.authenticate, async (req, res) => {
    const insights = await bmoniService.syncInsights(req.userId);
    res.json({ success: true, data: insights });
});
router.get("/me", auth_1.authenticate, async (req, res) => {
    const insights = await bmoniService.getInsights(req.userId);
    res.json({ success: true, data: insights });
});
exports.default = router;
//# sourceMappingURL=financial-insights.controller.js.map