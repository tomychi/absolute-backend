import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserCompanyRelations1753406112738 implements MigrationInterface {
    name = 'CreateUserCompanyRelations1753406112738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "access_levels" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "hierarchy_level" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_80b8fe1559f150c2091414f889c" UNIQUE ("name"), CONSTRAINT "PK_d10b6bf267d1d7cc39ac8c60e8d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_companies_status_enum" AS ENUM('pending', 'active', 'suspended', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "user_companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "access_level_id" integer NOT NULL, "invited_by" uuid, "status" "public"."user_companies_status_enum" NOT NULL DEFAULT 'active', "is_active" boolean NOT NULL DEFAULT true, "joined_at" TIMESTAMP, "last_activity" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_ca73b87c901966a9fb8960916df" UNIQUE ("user_id", "company_id"), CONSTRAINT "PK_f41bd3ea569c8c877b9a9063abb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_48240ff5cd6b408ea712684455" ON "user_companies" ("user_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_21c455abe658f42fd5535758c3" ON "user_companies" ("company_id", "status") `);
        await queryRunner.query(`CREATE TYPE "public"."user_permissions_module_enum" AS ENUM('products', 'inventory', 'customers', 'invoices', 'branches', 'reports', 'settings', 'users')`);
        await queryRunner.query(`CREATE TABLE "user_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_company_id" uuid NOT NULL, "module" "public"."user_permissions_module_enum" NOT NULL, "can_read" boolean NOT NULL DEFAULT true, "can_write" boolean NOT NULL DEFAULT false, "can_delete" boolean NOT NULL DEFAULT false, "can_export" boolean NOT NULL DEFAULT false, "can_import" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_5f6d6d5e912ad869a385a363856" UNIQUE ("user_company_id", "module"), CONSTRAINT "PK_01f4295968ba33d73926684264f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7e17cc075f89d62c101500b0c1" ON "user_permissions" ("user_company_id") `);
        await queryRunner.query(`ALTER TABLE "user_companies" ADD CONSTRAINT "FK_50c7d6aeb4ab214ad9fff29ab68" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_companies" ADD CONSTRAINT "FK_9e735e90e4fd3bbb4268ed96d94" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_companies" ADD CONSTRAINT "FK_e630b6c91857b146b9a131198a3" FOREIGN KEY ("access_level_id") REFERENCES "access_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_companies" ADD CONSTRAINT "FK_6c7ab536d39a76f42eb035ab67f" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_permissions" ADD CONSTRAINT "FK_7e17cc075f89d62c101500b0c19" FOREIGN KEY ("user_company_id") REFERENCES "user_companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_permissions" DROP CONSTRAINT "FK_7e17cc075f89d62c101500b0c19"`);
        await queryRunner.query(`ALTER TABLE "user_companies" DROP CONSTRAINT "FK_6c7ab536d39a76f42eb035ab67f"`);
        await queryRunner.query(`ALTER TABLE "user_companies" DROP CONSTRAINT "FK_e630b6c91857b146b9a131198a3"`);
        await queryRunner.query(`ALTER TABLE "user_companies" DROP CONSTRAINT "FK_9e735e90e4fd3bbb4268ed96d94"`);
        await queryRunner.query(`ALTER TABLE "user_companies" DROP CONSTRAINT "FK_50c7d6aeb4ab214ad9fff29ab68"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7e17cc075f89d62c101500b0c1"`);
        await queryRunner.query(`DROP TABLE "user_permissions"`);
        await queryRunner.query(`DROP TYPE "public"."user_permissions_module_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_21c455abe658f42fd5535758c3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_48240ff5cd6b408ea712684455"`);
        await queryRunner.query(`DROP TABLE "user_companies"`);
        await queryRunner.query(`DROP TYPE "public"."user_companies_status_enum"`);
        await queryRunner.query(`DROP TABLE "access_levels"`);
    }

}
