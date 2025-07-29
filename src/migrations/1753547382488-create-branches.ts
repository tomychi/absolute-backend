import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateBranches1753547382488 implements MigrationInterface {
    name = 'CreateBranches1753547382488'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."branches_type_enum" AS ENUM('retail', 'warehouse', 'office', 'virtual', 'distribution')`);
        await queryRunner.query(`CREATE TABLE "branches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "company_id" uuid NOT NULL, "code" character varying(20) NOT NULL, "type" "public"."branches_type_enum" NOT NULL DEFAULT 'retail', "address" text, "phone" character varying, "email" character varying, "manager_id" uuid, "is_active" boolean NOT NULL DEFAULT true, "is_main" boolean NOT NULL DEFAULT false, "latitude" numeric(10,8), "longitude" numeric(11,8), "business_hours" json, CONSTRAINT "UQ_06583786d73e7325630a0278ff5" UNIQUE ("company_id", "code"), CONSTRAINT "PK_7f37d3b42defea97f1df0d19535" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_554b23e83f117d08c59784caaa" ON "branches" ("company_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_771175396e6a72073697a38d4f" ON "branches" ("company_id", "is_active") `);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_5973f79e64a27c506b07cd84b29" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branches" ADD CONSTRAINT "FK_14da1875eaf9e5c81ca4678765d" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_14da1875eaf9e5c81ca4678765d"`);
        await queryRunner.query(`ALTER TABLE "branches" DROP CONSTRAINT "FK_5973f79e64a27c506b07cd84b29"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_771175396e6a72073697a38d4f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_554b23e83f117d08c59784caaa"`);
        await queryRunner.query(`DROP TABLE "branches"`);
        await queryRunner.query(`DROP TYPE "public"."branches_type_enum"`);
    }

}
