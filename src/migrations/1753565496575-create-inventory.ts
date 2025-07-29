import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInventory1753565496575 implements MigrationInterface {
    name = 'CreateInventory1753565496575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "stock_transfer_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "transfer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" numeric(10,2) NOT NULL, "unit_cost" numeric(12,2), CONSTRAINT "PK_8acee6121ab8a5135dc84495588" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_cb5cee89889c9acfd70cd51981" ON "stock_transfer_items" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a0f024e84c92b964c516aa7b7" ON "stock_transfer_items" ("transfer_id") `);
        await queryRunner.query(`CREATE TYPE "public"."stock_transfers_status_enum" AS ENUM('pending', 'in_transit', 'completed', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "stock_transfers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "from_branch_id" uuid NOT NULL, "to_branch_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."stock_transfers_status_enum" NOT NULL DEFAULT 'pending', "transfer_date" TIMESTAMP NOT NULL, "completed_date" TIMESTAMP, "completed_by" uuid, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ef738a3a4a578c7f1802c1bb50a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0389313a67720ba0ba4d661514" ON "stock_transfers" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cc680833a7bb0b30ab7826202e" ON "stock_transfers" ("transfer_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_84004eeaa39e7346921c319d96" ON "stock_transfers" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_4a22daeaaf163fb7508aceff81" ON "stock_transfers" ("to_branch_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_9b573720e43ecb7bb135ce7bfa" ON "stock_transfers" ("from_branch_id") `);
        await queryRunner.query(`CREATE TYPE "public"."stock_movements_type_enum" AS ENUM('purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'return', 'loss', 'found', 'initial')`);
        await queryRunner.query(`CREATE TABLE "stock_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "branch_id" uuid NOT NULL, "product_id" uuid NOT NULL, "user_id" uuid NOT NULL, "quantity" numeric(10,2) NOT NULL, "type" "public"."stock_movements_type_enum" NOT NULL, "reference_id" character varying, "notes" text, "cost_per_unit" numeric(12,2), "total_cost" numeric(12,2), "previous_quantity" numeric(10,2), "new_quantity" numeric(10,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_57a26b190618550d8e65fb860e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d7fedfd6ee0f4a06648c48631c" ON "stock_movements" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2da8647ef82e50376cfc1ae7f" ON "stock_movements" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_e41cb9aec65fb34fd0beb8336e" ON "stock_movements" ("product_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_a25cf0064c94a155111221c733" ON "stock_movements" ("branch_id", "type") `);
        await queryRunner.query(`CREATE INDEX "IDX_d02c620a3011045a37a113d34f" ON "stock_movements" ("branch_id", "product_id") `);
        await queryRunner.query(`CREATE TABLE "inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "branch_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" numeric(10,2) NOT NULL DEFAULT '0', "reserved_quantity" numeric(10,2) NOT NULL DEFAULT '0', "average_cost" numeric(12,2) DEFAULT '0', "last_updated" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4134b06019e35bdcceeb8f0743e" UNIQUE ("branch_id", "product_id"), CONSTRAINT "PK_82aa5da437c5bbfb80703b08309" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5a3822f15562775a8ce10191d5" ON "inventory" ("branch_id", "quantity") `);
        await queryRunner.query(`CREATE INDEX "IDX_732fdb1f76432d65d2c136340d" ON "inventory" ("product_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5e4d38ade6f246f20f468a7ad4" ON "inventory" ("branch_id") `);
        await queryRunner.query(`ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_6a0f024e84c92b964c516aa7b79" FOREIGN KEY ("transfer_id") REFERENCES "stock_transfers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transfer_items" ADD CONSTRAINT "FK_cb5cee89889c9acfd70cd519810" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_9b573720e43ecb7bb135ce7bfa5" FOREIGN KEY ("from_branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_4a22daeaaf163fb7508aceff814" FOREIGN KEY ("to_branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_0389313a67720ba0ba4d6615143" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" ADD CONSTRAINT "FK_dd67a6859e2e3fd60189804f0f0" FOREIGN KEY ("completed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_d7fedfd6ee0f4a06648c48631c6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_5e4d38ade6f246f20f468a7ad4b" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "inventory" ADD CONSTRAINT "FK_732fdb1f76432d65d2c136340dc" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_732fdb1f76432d65d2c136340dc"`);
        await queryRunner.query(`ALTER TABLE "inventory" DROP CONSTRAINT "FK_5e4d38ade6f246f20f468a7ad4b"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_d7fedfd6ee0f4a06648c48631c6"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_2c1bb05b80ddcc562cd28d826c6"`);
        await queryRunner.query(`ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_b85448ca9ec4bb8fc5eefb0c29d"`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT "FK_dd67a6859e2e3fd60189804f0f0"`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT "FK_0389313a67720ba0ba4d6615143"`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT "FK_4a22daeaaf163fb7508aceff814"`);
        await queryRunner.query(`ALTER TABLE "stock_transfers" DROP CONSTRAINT "FK_9b573720e43ecb7bb135ce7bfa5"`);
        await queryRunner.query(`ALTER TABLE "stock_transfer_items" DROP CONSTRAINT "FK_cb5cee89889c9acfd70cd519810"`);
        await queryRunner.query(`ALTER TABLE "stock_transfer_items" DROP CONSTRAINT "FK_6a0f024e84c92b964c516aa7b79"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e4d38ade6f246f20f468a7ad4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_732fdb1f76432d65d2c136340d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a3822f15562775a8ce10191d5"`);
        await queryRunner.query(`DROP TABLE "inventory"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d02c620a3011045a37a113d34f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a25cf0064c94a155111221c733"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e41cb9aec65fb34fd0beb8336e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2da8647ef82e50376cfc1ae7f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d7fedfd6ee0f4a06648c48631c"`);
        await queryRunner.query(`DROP TABLE "stock_movements"`);
        await queryRunner.query(`DROP TYPE "public"."stock_movements_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_9b573720e43ecb7bb135ce7bfa"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4a22daeaaf163fb7508aceff81"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_84004eeaa39e7346921c319d96"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cc680833a7bb0b30ab7826202e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0389313a67720ba0ba4d661514"`);
        await queryRunner.query(`DROP TABLE "stock_transfers"`);
        await queryRunner.query(`DROP TYPE "public"."stock_transfers_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a0f024e84c92b964c516aa7b7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cb5cee89889c9acfd70cd51981"`);
        await queryRunner.query(`DROP TABLE "stock_transfer_items"`);
    }

}
