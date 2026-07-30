"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const SettingsService_1 = require("../../services/SettingsService");
const router = (0, express_1.Router)();
const service = new SettingsService_1.SettingsService();
// GET /api/settings
router.get("/", auth_1.authenticate, async (req, res) => {
    const settings = await service.getSettings(req.userId);
    res.json({ success: true, data: settings });
});
// PUT /api/settings
router.put("/", auth_1.authenticate, async (req, res) => {
    const { notificationEmail, notificationSms, privacyMode } = req.body;
    const updated = await service.updateSettings(req.userId, {
        notificationEmail,
        notificationSms,
        privacyMode,
    });
    res.json({ success: true, data: updated });
});
exports.default = router;
//# sourceMappingURL=settings.controller.js.map