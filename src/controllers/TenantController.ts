import type { NextFunction, Request, Response } from "express";
import { matchedData, validationResult } from "express-validator";
import createHttpError from "http-errors";
import { inject, injectable } from "inversify";
import type { Logger } from "winston";
import TYPES from "../config/types.ts";
import type { TenantService } from "../services/TenantService.ts";
import type { CreateTenantRequest, TenantQueryParams } from "../types/index.ts";

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

  async update(req: CreateTenantRequest, res: Response, next: NextFunction) {
    // Validation
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    }

    const { name, address } = req.body;
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    this.logger.debug("Request for updating a tenant", req.body);

    try {
      await this.tenantService.update(Number(tenantId), {
        name,
        address,
      });

      this.logger.info("Tenant has been updated", { id: tenantId });

      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    const validatedQuery = matchedData(req, { onlyValidData: true });
    try {
      const [tenants, count] = await this.tenantService.getAll(
        validatedQuery as TenantQueryParams,
      );

      this.logger.info("All tenant have been fetched");
      res.json({
        currentPage: validatedQuery.currentPage as number,
        perPage: validatedQuery.perPage as number,
        total: count,
        data: tenants,
      });

      res.json(tenants);
    } catch (err) {
      next(err);
    }
  }

  async getOne(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      const tenant = await this.tenantService.getById(Number(tenantId));

      if (!tenant) {
        next(createHttpError(400, "Tenant does not exist."));
        return;
      }

      this.logger.info("Tenant has been fetched");
      res.json(tenant);
    } catch (err) {
      next(err);
    }
  }

  async destroy(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.params.id;

    if (isNaN(Number(tenantId))) {
      next(createHttpError(400, "Invalid url param."));
      return;
    }

    try {
      await this.tenantService.deleteById(Number(tenantId));

      this.logger.info("Tenant has been deleted", {
        id: Number(tenantId),
      });
      res.json({ id: Number(tenantId) });
    } catch (err) {
      next(err);
    }
  }
}
