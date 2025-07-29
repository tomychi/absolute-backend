import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProducts1753558452702 implements MigrationInterface {
    name = 'CreateProducts1753558452702'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."products_type_enum" AS ENUM('physical', 'digital', 'service', 'subscription')`);
        await queryRunner.query(`CREATE TYPE "public"."products_status_enum" AS ENUM('active', 'inactive', 'discontinued', 'out_of_stock')`);
        await queryRunner.query(`CREATE TYPE "public"."products_unit_enum" AS ENUM('unit', 'kg', 'gram', 'liter', 'meter', 'square_meter', 'cubic_meter', 'pack', 'box', 'dozen')`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "company_id" uuid NOT NULL, "sku" character varying, "description" text, "price" numeric(12,2) NOT NULL DEFAULT '0', "cost" numeric(12,2) DEFAULT '0', "type" "public"."products_type_enum" NOT NULL DEFAULT 'physical', "status" "public"."products_status_enum" NOT NULL DEFAULT 'active', "unit" "public"."products_unit_enum" NOT NULL DEFAULT 'unit', "is_active" boolean NOT NULL DEFAULT true, "track_inventory" boolean NOT NULL DEFAULT true, "allow_backorder" boolean NOT NULL DEFAULT false, "min_stock_level" integer NOT NULL DEFAULT '0', "max_stock_level" integer, "reorder_point" integer NOT NULL DEFAULT '0', "reorder_quantity" integer NOT NULL DEFAULT '0', "dimensions" json, "metadata" json, "image_url" character varying, "barcode" character varying, CONSTRAINT "UQ_c44ac33a05b144dd0d9ddcf9327" UNIQUE ("sku"), CONSTRAINT "UQ_4af79b7459791a250e1cd546176" UNIQUE ("company_id", "sku"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c44ac33a05b144dd0d9ddcf932" ON "products" ("sku") `);
        await queryRunner.query(`CREATE INDEX "IDX_4c9fb58de893725258746385e1" ON "products" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_2a7805267f7e7b656d17b628f1" ON "products" ("company_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfcce7de7f8e7badc8abc3e071" ON "products" ("company_id", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_143bb25d8d1cfb546a452277b0" ON "products" ("company_id", "is_active") `);
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_b417f1726f6ccafb18730adffb0" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_b417f1726f6ccafb18730adffb0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_143bb25d8d1cfb546a452277b0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfcce7de7f8e7badc8abc3e071"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a7805267f7e7b656d17b628f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c9fb58de893725258746385e1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c44ac33a05b144dd0d9ddcf932"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TYPE "public"."products_unit_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."products_type_enum"`);
    }

}
