import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DataSourceConfig } from './config/data.source';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { UserCompaniesModule } from './modules/user-companies/user-companies.module';
import { AccessLevelsService } from './modules/access-levels/services/access-levels.service';
import { AccessLevelsModule } from './modules/access-levels/access-levels.module';
import { BranchesModule } from './modules/branches/branches.module';
import { ProductsModule } from './modules/products/products.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InvoicesModule } from './modules/invoices/invoices.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV || 'development'}.env`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(DataSourceConfig),

    // Rate limiting global
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1 segundo
          limit: 3, // 3 requests por segundo
        },
        {
          name: 'medium',
          ttl: 10000, // 10 segundos
          limit: 20, // 20 requests por 10 segundos
        },
        {
          name: 'long',
          ttl: 60000, // 1 minuto
          limit: 100, // 100 requests por minuto
        },
      ],
    }),

    UsersModule,
    AuthModule,
    CompaniesModule,
    AccessLevelsModule,
    UserCompaniesModule,
    BranchesModule,
    ProductsModule,
    InventoryModule,
  ] as const,

  providers: [
    // Guard global para rate limiting
    {
      provide: APP_GUARD,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      useClass: ThrottlerGuard,
    },
    AccessLevelsService,
  ],
})
export class AppModule {}
