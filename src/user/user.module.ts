import { Global, Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UserController } from './controllers/user.controller';
import { UserCompanyEntity } from './entities/userCompany.entity';
import { CompanyEntity } from '../company/entities/company.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserCompanyEntity, CompanyEntity]),
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService, TypeOrmModule],
})
export class UserModule {}
