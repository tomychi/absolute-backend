import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCustomers1753936515268 implements MigrationInterface {
    name = 'CreateCustomers1753936515268'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit_price" numeric(12,2) NOT NULL, "total_price" numeric(12,2) NOT NULL, "discount_amount" numeric(12,2) NOT NULL DEFAULT '0', "product_name" character varying NOT NULL, "product_sku" character varying, "product_description" character varying, CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoices_status_enum" AS ENUM('draft', 'pending', 'paid', 'cancelled', 'overdue')`);
        await queryRunner.query(`CREATE TABLE "invoices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoice_number" character varying NOT NULL, "branch_id" uuid NOT NULL, "customer_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."invoices_status_enum" NOT NULL DEFAULT 'draft', "subtotal_amount" numeric(12,2) NOT NULL DEFAULT '0', "tax_amount" numeric(12,2) NOT NULL DEFAULT '0', "discount_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_amount" numeric(12,2) NOT NULL DEFAULT '0', "tax_rate" numeric(5,2) NOT NULL DEFAULT '0', "discount_rate" numeric(5,2) NOT NULL DEFAULT '0', "due_date" TIMESTAMP, "paid_date" TIMESTAMP, "notes" text, "issued_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_d8f8d3788694e1b3f96c42c36fb" UNIQUE ("invoice_number"), CONSTRAINT "PK_668cef7c22a427fd822cc1be3ce" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d8f8d3788694e1b3f96c42c36f" ON "invoices" ("invoice_number") `);
        await queryRunner.query(`CREATE INDEX "IDX_6d3bed542156c4ab9b2b0c50ee" ON "invoices" ("status", "issued_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_8dc59d3a2906e4c167f0f65423" ON "invoices" ("customer_id", "issued_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_fd6e63808cdb9ec65e1913187c" ON "invoices" ("branch_id", "issued_at") `);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying, "last_name" character varying, "tax_id" character varying, "email" character varying, "phone" character varying, "company_id" uuid NOT NULL, CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_946a7a5519eab49537ba6be271" ON "customers" ("company_id", "email") `);
        await queryRunner.query(`CREATE INDEX "IDX_6b19d2a8cf4f6c56da3b92a714" ON "customers" ("company_id", "tax_id") `);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_dc991d555664682cfe892eea2c1" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_5a76734b5eead0967cf6ee3abc0" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_f8b468df52fb45053ad0c4ca38b" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_65e3145f317bd655481d3f96c74" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_f0e29920aaf871f3eddbea69f0d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_f0e29920aaf871f3eddbea69f0d"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_26daf5e433d6fb88ee32ce93637"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_65e3145f317bd655481d3f96c74"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_f8b468df52fb45053ad0c4ca38b"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_5a76734b5eead0967cf6ee3abc0"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_dc991d555664682cfe892eea2c1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6b19d2a8cf4f6c56da3b92a714"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_946a7a5519eab49537ba6be271"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd6e63808cdb9ec65e1913187c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8dc59d3a2906e4c167f0f65423"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d3bed542156c4ab9b2b0c50ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d8f8d3788694e1b3f96c42c36f"`);
        await queryRunner.query(`DROP TABLE "invoices"`);
        await queryRunner.query(`DROP TYPE "public"."invoices_status_enum"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
    }

}
