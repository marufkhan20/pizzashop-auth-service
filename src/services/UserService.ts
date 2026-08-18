import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { UserData } from "../types/index.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";
import createHttpError from "http-errors";
import { Roles } from "../constants/index.ts";
import type { HashService } from "./HashService.ts";

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: Repository<User>,
    @inject(TYPES.HashService) private hashService: HashService,
  ) {}

  async create({ firstName, lastName, email, password }: UserData) {
    // hash the password
    const hashedPassword = await this.hashService.create(password);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.CUSTOMER,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to store the data in the database",
      );

      throw error;
    }
  }
}
