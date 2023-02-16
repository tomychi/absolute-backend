import { MigrationInterface, QueryRunner } from "typeorm";

export class init1676523193994 implements MigrationInterface {
    name = 'init1676523193994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "address" SET DEFAULT 'calle 2'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "address" DROP DEFAULT`);
    }

}
