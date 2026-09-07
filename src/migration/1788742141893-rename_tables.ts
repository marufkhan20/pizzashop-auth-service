import type { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTables1788742141893 implements MigrationInterface {
  name = "RenameTables1788742141893";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_token" DROP CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe"`,
    );

    await queryRunner.renameTable("user", "users");
    await queryRunner.renameTable("refresh_token", "refreshTokens");

    await queryRunner.query(
      `ALTER TABLE "refreshTokens" ADD CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refreshTokens" DROP CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe"`,
    );

    await queryRunner.renameTable("users", "user");
    await queryRunner.renameTable("refreshTokens", "refresh_token");
  }
}
