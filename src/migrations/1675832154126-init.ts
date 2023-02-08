import { MigrationInterface, QueryRunner } from "typeorm";

export class init1675832154126 implements MigrationInterface {
    name = 'init1675832154126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "UQ_048a28949bb332d397edb9b7ab1"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "UQ_048a28949bb332d397edb9b7ab1" UNIQUE ("stock")`);
    }

}
