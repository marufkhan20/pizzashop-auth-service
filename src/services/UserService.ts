import type { Repository } from "typeorm";
import { User } from "../entities/User.ts";
import type { UserData } from "../types/index.ts";
import { injectable, inject } from "inversify";
import TYPES from "../config/types.ts";
import createHttpError from "http-errors";
import { Roles } from "../constants/index.ts";
import bcrypt from "bcrypt";

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: Repository<User>,
  ) {}

  async create({ firstName, lastName, email, password }: UserData) {
    // hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
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
