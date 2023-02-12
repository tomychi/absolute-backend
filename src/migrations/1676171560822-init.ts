import { MigrationInterface, QueryRunner } from "typeorm";

export class init1676171560822 implements MigrationInterface {
    name = 'init1676171560822'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "image" character varying NOT NULL DEFAULT 'https://icons8.com/icon/gwhmHssBJGbc/box'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "image"`);
    }

}
