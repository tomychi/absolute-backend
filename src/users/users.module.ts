import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/users.entity';
import { UsersCompaniesEntity } from './entities/usersCompanies.entity';
import { CompaniesModule } from '../companies/companies.module';
import { CompaniesService } from '../companies/services/companies.service';
import { CompaniesEntity } from '../companies/entities/companies.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsersEntity,
      UsersCompaniesEntity,
      CompaniesEntity,
    ]),
    CompaniesModule,
  ],
  providers: [UsersService, CompaniesService],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
