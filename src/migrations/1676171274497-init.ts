import { MigrationInterface, QueryRunner } from "typeorm";

export class init1676171274497 implements MigrationInterface {
    name = 'init1676171274497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "age" TO "image"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "image" character varying NOT NULL DEFAULT 'https://icons8.com/icon/ARWy_JjgohtA/customer'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "image"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "image" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "image" TO "age"`);
    }

}
