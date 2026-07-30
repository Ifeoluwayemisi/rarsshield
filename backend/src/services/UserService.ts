import { UserRepository } from "../repositories/UserRepository";
import { NotFoundError } from "../errors/NotFoundError";

export class UserService {
  private userRepository = new UserRepository();

  async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { password, ...result } = user;
    return result;
  }

  async updateProfile(
    userId: string,
    data: Partial<{ name: string; role: string }>,
  ) {
    const user = await this.userRepository.update(userId, { name: data.name });
    const { password, ...result } = user;
    return result;
  }
}
