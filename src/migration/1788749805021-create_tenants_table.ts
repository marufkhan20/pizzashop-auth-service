import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTenantsTable1788749805021 implements MigrationInterface {
  name = "CreateTenantsTable1788749805021";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe"`,
    );
    await queryRunner.query(
      `CREATE TABLE "tenants" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "address" character varying(255) NOT NULL, "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "PK_c4a0078b846c2c4508473680625" PRIMARY KEY ("id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT "PK_c4a0078b846c2c4508473680625"`,
    );
    await queryRunner.query(`DROP TABLE "tenants"`);
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
