"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const UserRepository_1 = require("../repositories/UserRepository");
const NotFoundError_1 = require("../errors/NotFoundError");
class UserService {
    userRepository = new UserRepository_1.UserRepository();
    async getProfile(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError_1.NotFoundError("User not found");
        }
        const { password, ...result } = user;
        return result;
    }
    async updateProfile(userId, data) {
        const user = await this.userRepository.update(userId, { name: data.name });
        const { password, ...result } = user;
        return result;
    }
}
exports.UserService = UserService;
//# sourceMappingURL=UserService.js.map