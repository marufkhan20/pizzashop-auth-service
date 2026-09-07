import { inject, injectable } from "inversify";
import type { Repository } from "typeorm";
import TYPES from "../config/types.ts";
import type { Tenant } from "../entities/Tenant.ts";
import type { ITenant } from "../types/index.ts";

@injectable()
export class TenantService {
  constructor(
    @inject(TYPES.TenantRepository)
    private tenantRepository: Repository<Tenant>,
  ) {}

  async create(tenantData: ITenant) {
    return await this.tenantRepository.save(tenantData);
  }

  async findById(id: number) {
    // check user using email
    return await this.tenantRepository.findOne({ where: { id } });
  }
}
