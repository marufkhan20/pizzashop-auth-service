import type { NextFunction, Response } from "express";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";
import TYPES from "../config/types.ts";
import type { TenantService } from "../services/TenantService.ts";
import type { CreateTenantRequest } from "../types/index.ts";

@injectable()
export class TenantController {
  constructor(
    @inject(TYPES.TenantService) private tenantService: TenantService,
    @inject(TYPES.logger) private logger: Logger,
  ) {}

  async create(req: CreateTenantRequest, res: Response, next: NextFunction) {
    try {
      const { name, address } = req.body || {};

      this.logger.info("Create a new tenant request", { name, address });

      const tenant = await this.tenantService.create({ name, address });

      this.logger.info("Tenant has been created", { id: tenant.id });

      res.status(201).json(tenant);
    } catch (error) {
      next(error);
    }
  }
}
