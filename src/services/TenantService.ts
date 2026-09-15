import { inject, injectable } from "inversify";
import type { Repository } from "typeorm";
import TYPES from "../config/types.ts";
import type { Tenant } from "../entities/Tenant.ts";
import type { ITenant, TenantQueryParams } from "../types/index.ts";

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

  async update(id: number, tenantData: ITenant) {
    return await this.tenantRepository.update(id, tenantData);
  }

  async getAll(validatedQuery: TenantQueryParams) {
    const queryBuilder = this.tenantRepository.createQueryBuilder("tenant");

    if (validatedQuery.q) {
      const searchTerm = `%${validatedQuery.q}%`;
      queryBuilder.where("CONCAT(tenant.name, ' ', tenant.address) ILike :q", {
        q: searchTerm,
      });
    }

    const result = await queryBuilder
      .skip((validatedQuery.currentPage - 1) * validatedQuery.perPage)
      .take(validatedQuery.perPage)
      .orderBy("tenant.id", "DESC")
      .getManyAndCount();
    return result;
  }

  async getById(tenantId: number) {
    return await this.tenantRepository.findOne({ where: { id: tenantId } });
  }

  async deleteById(tenantId: number) {
    return await this.tenantRepository.delete(tenantId);
  }
}
