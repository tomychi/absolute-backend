import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1749658522014 implements MigrationInterface {
    name = 'Init1749658522014'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stock_movement_type" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" text, "is_addition" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_06e5468dce2eafef7d2c9218c6b" UNIQUE ("name"), CONSTRAINT "PK_98bd5a582e97d80279b7fbab20f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "stock_movement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "quantity" integer NOT NULL, "reference" character varying NOT NULL, "note" text, "branch_id" uuid, "movement_type_id" uuid, "user_id" uuid, "product_id" uuid NOT NULL, CONSTRAINT "PK_9fe1232f916686ae8cf00294749" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying NOT NULL, "category" character varying NOT NULL, "price" numeric(10,2) NOT NULL, "upc" character varying NOT NULL, "sku" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "company_id" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "stock" integer NOT NULL, "product_id" uuid, "branch_id" uuid, CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "total" numeric(10,2) NOT NULL, "invoice_id" uuid, "product_id" uuid, CONSTRAINT "PK_621317346abdf61295516f3cb76" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "is_generic" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "email" character varying NOT NULL, "phone" character varying NOT NULL, "address" character varying NOT NULL, "company_id" uuid, CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."invoice_status_enum" AS ENUM('DRAFT', 'ISSUED', 'CANCELLED', 'PAID')`);
        await queryRunner.query(`CREATE TABLE "invoice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "invoice_number" character varying NOT NULL, "subtotal" numeric(10,2) NOT NULL, "tax" numeric(10,2) NOT NULL, "total" numeric(10,2) NOT NULL, "note" character varying, "status" "public"."invoice_status_enum" NOT NULL DEFAULT 'DRAFT', "customer_id" uuid, "branch_id" uuid, "user_id" uuid, "company_id" uuid, CONSTRAINT "UQ_c7ec75a1a4068196ea74b920df9" UNIQUE ("invoice_number"), CONSTRAINT "PK_15d25c200d9bcd8a33f698daf18" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "branch" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "location" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, "company_id" uuid, CONSTRAINT "PK_2e39f426e2faefdaa93c5961976" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "address" character varying NOT NULL, "is_deleted" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_056f7854a7afdba7cbd6d45fc20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_company_access_level_enum" AS ENUM('50', '40', '30', '20', '10')`);
        await queryRunner.query(`CREATE TABLE "user_company" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "access_level" "public"."user_company_access_level_enum" NOT NULL, "user_id" uuid, "company_id" uuid, CONSTRAINT "PK_9e70b5f9d7095018e86970c7874" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'DEVELOPER', 'USER')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "stock_movement" ADD CONSTRAINT "FK_3695701a949574c5d636d13e218" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movement" ADD CONSTRAINT "FK_5034801efabed2be5e4dc49bddc" FOREIGN KEY ("movement_type_id") REFERENCES "stock_movement_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movement" ADD CONSTRAINT "FK_3b18e00b1037e39022647f09275" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movement" ADD CONSTRAINT "FK_c1bf5ff45511ecaad0b28440e30" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "FK_a0503db1630a5b8a4d7deabd556" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_5e4d38ade6f246f20f468a7ad4b" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_9830c1881dd701d440c2164c3cd" FOREIGN KEY ("invoice_id") REFERENCES "invoice"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_item" ADD CONSTRAINT "FK_7e6e8d3c1449a7ec83b2b5491f6" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customer" ADD CONSTRAINT "FK_170a73f2523d7ca266834e38ef1" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_2e6c81055e67a7f4791c887b56f" FOREIGN KEY ("customer_id") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_1a9acbae68dbaa913c969eda740" FOREIGN KEY ("branch_id") REFERENCES "branch"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_c14b00795593eafc9d423e7f74d" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice" ADD CONSTRAINT "FK_7718b2d8c649496f6ffd8e0399d" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "branch" ADD CONSTRAINT "FK_876085341242e41592b0e6b15e0" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_company" ADD CONSTRAINT "FK_128160a3dfe4065da308a3cc6b3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_company" ADD CONSTRAINT "FK_a34b2349be9db8ab53fe3d0e230" FOREIGN KEY ("company_id") REFERENCES "company"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_company" DROP CONSTRAINT "FK_a34b2349be9db8ab53fe3d0e230"`);
        await queryRunner.query(`ALTER TABLE "user_company" DROP CONSTRAINT "FK_128160a3dfe4065da308a3cc6b3"`);
        await queryRunner.query(`ALTER TABLE "branch" DROP CONSTRAINT "FK_876085341242e41592b0e6b15e0"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_7718b2d8c649496f6ffd8e0399d"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_c14b00795593eafc9d423e7f74d"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_1a9acbae68dbaa913c969eda740"`);
        await queryRunner.query(`ALTER TABLE "invoice" DROP CONSTRAINT "FK_2e6c81055e67a7f4791c887b56f"`);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_170a73f2523d7ca266834e38ef1"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_7e6e8d3c1449a7ec83b2b5491f6"`);
        await queryRunner.query(`ALTER TABLE "invoice_item" DROP CONSTRAINT "FK_9830c1881dd701d440c2164c3cd"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_5e4d38ade6f246f20f468a7ad4b"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "FK_a0503db1630a5b8a4d7deabd556"`);
        await queryRunner.query(`ALTER TABLE "stock_movement" DROP CONSTRAINT "FK_c1bf5ff45511ecaad0b28440e30"`);
        await queryRunner.query(`ALTER TABLE "stock_movement" DROP CONSTRAINT "FK_3b18e00b1037e39022647f09275"`);
        await queryRunner.query(`ALTER TABLE "stock_movement" DROP CONSTRAINT "FK_5034801efabed2be5e4dc49bddc"`);
        await queryRunner.query(`ALTER TABLE "stock_movement" DROP CONSTRAINT "FK_3695701a949574c5d636d13e218"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_company"`);
        await queryRunner.query(`DROP TYPE "public"."user_company_access_level_enum"`);
        await queryRunner.query(`DROP TABLE "company"`);
        await queryRunner.query(`DROP TABLE "branch"`);
        await queryRunner.query(`DROP TABLE "invoice"`);
        await queryRunner.query(`DROP TYPE "public"."invoice_status_enum"`);
        await queryRunner.query(`DROP TABLE "customer"`);
        await queryRunner.query(`DROP TABLE "invoice_item"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "stock_movement"`);
        await queryRunner.query(`DROP TABLE "stock_movement_type"`);
    }

}
