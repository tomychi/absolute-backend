import { MigrationInterface, QueryRunner } from 'typeorm';

export class Companies1753395502840 implements MigrationInterface {
  name = 'Companies1753395502840';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "tax_id" character varying, "address" text, "phone" character varying, "email" character varying, "website" character varying, "description" text, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_37777cf58dd19fb6a6f5cf36bc8" UNIQUE ("tax_id"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
