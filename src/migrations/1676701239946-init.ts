import { MigrationInterface, QueryRunner } from "typeorm";

export class init1676701239946 implements MigrationInterface {
    name = 'init1676701239946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT 'https://e7.pngegg.com/pngimages/343/677/png-clipart-computer-icons-user-profile-login-my-account-icon-heroes-black-thumbnail.png'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "image" SET DEFAULT 'https://res.cloudinary.com/db2gtt9hk/image/upload/v1676701165/default/wqkjzjppjplc3hyjbzo2.jpg'`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "image" SET DEFAULT 'https://res.cloudinary.com/db2gtt9hk/image/upload/v1676701165/default/wqkjzjppjplc3hyjbzo2.jpg'`);
        await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "image" SET DEFAULT 'https://res.cloudinary.com/db2gtt9hk/image/upload/v1676701165/default/wqkjzjppjplc3hyjbzo2.jpg'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/organization.png'`);
        await queryRunner.query(`ALTER TABLE "locations" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/small-business.png'`);
        await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/box.png'`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "image" SET DEFAULT 'https://img.icons8.com/officel/16/null/gender-neutral-user.png'`);
    }

}
