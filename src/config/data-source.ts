import { fileURLToPath } from "node:url";
import path from "node:path";
import "reflect-metadata";
import { DataSource } from "typeorm";
import { RefreshToken } from "../entities/RefreshToken.ts";
import { Tenant } from "../entities/Tenant.ts";
import { User } from "../entities/User.ts";
import { Migration1788740813733 } from "../migration/1788740813733-migration.ts";
import { RenameTables1788742141893 } from "../migration/1788742141893-rename_tables.ts";
import { CreateTenantsTable1788749805021 } from "../migration/1788749805021-create_tenants_table.ts";
import { AddTenantIdForeignKey1788750144150 } from "../migration/1788750144150-add_tenantId_foreign_key.ts";
import { Config } from "./index.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: "postgres",
  host: Config.DB_HOST,
  port: Number(Config.DB_PORT),
  username: Config.DB_USERNAME,
  password: Config.DB_PASSWORD,
  database: Config.DB_NAME,
  synchronize: Config.NODE_ENV === "test",
  logging: false,
  entities:
    Config.NODE_ENV === "test"
      ? [User, RefreshToken, Tenant]
      : [path.join(__dirname, "../entities/*.{ts,js}")],
  migrations:
    Config.NODE_ENV === "test"
      ? [
          Migration1788740813733,
          RenameTables1788742141893,
          CreateTenantsTable1788749805021,
          AddTenantIdForeignKey1788750144150,
        ]
      : [path.join(__dirname, "../migration/*.{ts,js}")],
  subscribers: [],
});
