import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesModule } from './companies/companies.module';
import { DataSourceConfig } from './config/data.source';
import { UsersModule } from './users/users.module';
import { LocationsModule } from './locations/locations.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...DataSourceConfig,
    }),
    UsersModule,
    CompaniesModule,
    LocationsModule,
    ProductsModule,
  ],
})
export class AppModule {}
