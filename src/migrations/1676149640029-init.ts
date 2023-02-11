import { MigrationInterface, QueryRunner } from "typeorm";

export class init1676149640029 implements MigrationInterface {
    name = 'init1676149640029'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "locations_products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "stock" integer NOT NULL, "location_id" uuid, "product_id" uuid, CONSTRAINT "PK_9f264c83d17bb540c5abdd64804" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "model"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "stock"`);
        await queryRunner.query(`ALTER TABLE "locations" ADD "image" character varying NOT NULL DEFAULT 'https://icons8.com/icon/USd846iCsct5/small-business'`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "image" character varying NOT NULL DEFAULT 'https://icons8.com/icon/a9ys54NktmiO/organization'`);
        await queryRunner.query(`ALTER TABLE "locations_products" ADD CONSTRAINT "FK_c4f02c8e9be17b93b5e75c43066" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "locations_products" ADD CONSTRAINT "FK_d31e16473c5846374b2a71a6f90" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations_products" DROP CONSTRAINT "FK_d31e16473c5846374b2a71a6f90"`);
        await queryRunner.query(`ALTER TABLE "locations_products" DROP CONSTRAINT "FK_c4f02c8e9be17b93b5e75c43066"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "products" ADD "stock" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "products" ADD "model" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "locations_products"`);
    }

}
