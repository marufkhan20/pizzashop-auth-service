import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { UserData } from "../types/index.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: Repository<User>,
  ) {}

  async create({ firstName, lastName, email, password }: UserData) {
    return await this.userRepository.save({
      firstName,
      lastName,
      email,
      password,
    });
  }
}
