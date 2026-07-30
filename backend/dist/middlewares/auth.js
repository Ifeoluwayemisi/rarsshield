"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const UnauthorizedError_1 = require("../errors/UnauthorizedError");
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError_1.UnauthorizedError("Missing authorization header");
    }
    const token = authHeader.split(" ")[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, config_1.default.jwt.accessTokenSecret);
        req.userId = payload.sub;
        next();
    }
    catch (error) {
        throw new UnauthorizedError_1.UnauthorizedError("Invalid access token");
    }
}
//# sourceMappingURL=auth.js.map