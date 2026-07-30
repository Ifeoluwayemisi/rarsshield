"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middlewares/auth");
const UserService_1 = require("../../services/UserService");
const router = (0, express_1.Router)();
const userService = new UserService_1.UserService();
router.get("/me", auth_1.authenticate, async (req, res) => {
    const user = await userService.getProfile(req.userId);
    res.json({ success: true, data: user });
});
router.put("/me", auth_1.authenticate, async (req, res) => {
    const user = await userService.updateProfile(req.userId, req.body);
    res.json({ success: true, data: user });
});
exports.default = router;
//# sourceMappingURL=users.controller.js.map