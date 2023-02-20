import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { UserDTO, UserToCompanyDTO, UserUpdateDTO } from '../dto/user.dto';
import { UsersService } from '../services/users.service';
import { CompanyDTO } from '../../companies/dto/company.dto';
import { CompaniesService } from '../../companies/services/companies.service';
import { Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly companiesService: CompaniesService,
  ) {}

  @Post('register')
  public async registerUser(@Body() body: UserDTO) {
    return await this.usersService.createUser(body);
  }

  @Get('all')
  public async findAllUsers() {
    return await this.usersService.findUsers();
  }

  @Get(':id')
  public async findUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.findUserById(id);
  }

  @Put('edit/:id')
  public async updateUser(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UserUpdateDTO,
  ) {
    return await this.usersService.updateUser(body, id);
  }

  @Delete('delete/:id')
  public async deleteUser(@Param('id', new ParseUUIDPipe()) id: string) {
    return await this.usersService.deleteUser(id);
  }

  // Cuando un OWNER de una empresa agrega empleados

  @Post('add-to-company')
  public async addTocompany(@Body() body: UserToCompanyDTO) {
    return await this.usersService.relationToCompany(body);
  }

  // cuando un usuario crea una empresa
  @Post('create-company/:id')
  public async createCompany(
    @Body() body: CompanyDTO,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    const company = await this.companiesService.createCompany(body);
    const owner = await this.usersService.findUserById(id);

    const relationData: UserToCompanyDTO = {
      user: owner,
      company: company,
      accessLevel: 50,
    };
    await this.usersService.relationToCompany(relationData);

    return company;
  }

  // traerme la company con el usuario
  @Get('user-with-company/:userId/:companyId')
  public async userWithCompany(
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('companyId', new ParseUUIDPipe()) companyId: string,
  ) {
    return await this.usersService.findUserWithCompanyId(userId, companyId);
  }
}
