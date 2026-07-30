"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedError = void 0;
class NotImplementedError extends Error {
    constructor(feature) {
        super(`${feature} is not implemented yet`);
        this.name = "NotImplementedError";
    }
}
exports.NotImplementedError = NotImplementedError;
//# sourceMappingURL=not-implemented.error.js.map