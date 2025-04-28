import { Module } from '@nestjs/common';
import { CompanyModule } from './company/company.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { BranchModule } from './branch/branch.module';
import { InventoryModule } from './inventory/inventory.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({ ...DataSourceConfig }),
    CompanyModule,
    UserModule,
    AuthModule,
    BranchModule,
    InventoryModule,
    ProductModule,
  ],
})
export class AppModule {}
