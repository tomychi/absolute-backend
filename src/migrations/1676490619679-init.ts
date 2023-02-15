import { MigrationInterface, QueryRunner } from "typeorm";

export class init1676490619679 implements MigrationInterface {
    name = 'init1676490619679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/gender-neutral-user.png'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/box.png'`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/small-business.png'`);
        await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/organization.png'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "image" SET DEFAULT 'https://icons8.com/icon/a9ys54NktmiO/organization'`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "image" SET DEFAULT 'https://icons8.com/icon/USd846iCsct5/small-business'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "image" SET DEFAULT 'https://icons8.com/icon/gwhmHssBJGbc/box'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT 'https://icons8.com/icon/ARWy_JjgohtA/customer'`);
    }

}
