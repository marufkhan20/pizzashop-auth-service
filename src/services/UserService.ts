import createHttpError from "http-errors";
import { inject, injectable } from "inversify";
import { Brackets, QueryFailedError, type Repository } from "typeorm";
import TYPES from "../config/types.ts";
import { Roles } from "../constants/index.ts";
import type { User } from "../entities/User.ts";
import type {
  LimitedUserData,
  UserData,
  UserQueryParams,
} from "../types/index.ts";
import type { HashService } from "./HashService.ts";

// Postgres error code for a unique-constraint violation.
const POSTGRES_UNIQUE_VIOLATION_CODE = "23505";

@injectable()
export class UserService {
  constructor(
    @inject(TYPES.UserRepository) private userRepository: Repository<User>,
    @inject(TYPES.HashService) private hashService: HashService,
  ) {}

  async create({
    firstName,
    lastName,
    email,
    password,
    role,
    tenantId,
  }: UserData) {
    // check user existence using email
    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      const err = createHttpError(400, "Email is already exists!");
      throw err;
    }

    // hash the password
    const hashedPassword = await this.hashService.create(password);
    try {
      return await this.userRepository.save({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        tenant: tenantId ? { id: Number(tenantId) } : null,
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

  //  Create admin user
  async createAdminUser({
    firstName,
    lastName,
    email,
    password,
  }: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const hashedPassword = await this.hashService.create(password);

    try {
      await this.userRepository.insert({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Roles.ADMIN,
        tenant: null,
      });
      return { created: true };
    } catch (err) {
      const isUniqueViolation =
        err instanceof QueryFailedError &&
        (err as unknown as { code?: string }).code ===
          POSTGRES_UNIQUE_VIOLATION_CODE;

      if (isUniqueViolation) {
        // Another instance already created the admin — nothing to do.
        return { created: false };
      }

      throw err;
    }
  }

  async findByEmailWithPassword(email: string) {
    return await this.userRepository.findOne({
      where: {
        email,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        password: true,
      },
    });
  }

  async findById(id: number) {
    // check user using email
    return await this.userRepository.findOne({ where: { id } });
  }

  async update(
    userId: number,
    { firstName, lastName, role, email, tenantId }: LimitedUserData,
  ) {
    try {
      return await this.userRepository.update(userId, {
        firstName,
        lastName,
        role,
        email,
        tenant: tenantId ? { id: tenantId } : null,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const error = createHttpError(
        500,
        "Failed to update the user in the database",
      );
      throw error;
    }
  }

  async getAll(validatedQuery: UserQueryParams) {
    const queryBuilder = this.userRepository.createQueryBuilder("user");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where(
        new Brackets((qb) => {
          qb.where("CONCAT(user.firstName, ' ', user.lastName) ILike :q", {
            q: searchTerm,
          }).orWhere("user.email ILike :q", { q: searchTerm });
        }),
      );
    }

    if (validatedQuery.role) {
      queryBuilder.andWhere("user.role = :role", {
        role: validatedQuery.role,
      });
    }

    const result = await queryBuilder
      .leftJoinAndSelect("user.tenant", "tenant")
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("user.id", "DESC")
      .getManyAndCount();
    return result;
  }

  async deleteById(userId: number) {
    return await this.userRepository.delete(userId);
  }
}
