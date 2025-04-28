import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  UserCreateDTO,
  UserToCompanyCreateDTO,
  UserUpdateDTO,
} from '../dto/user.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { UserCompanyEntity } from '../entities/userCompany.entity';
import { CompanyEntity } from '../../company/entities/company.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CompanyEntity)
    private readonly companyRepository: Repository<CompanyEntity>,
    @InjectRepository(UserCompanyEntity)
    private readonly userCompanyRepository: Repository<UserCompanyEntity>,
  ) {}

  public async createUserCreator(body: UserCreateDTO): Promise<UserEntity> {
    try {
      body.password = await bcrypt.hash(body.password, +process.env.HASH_SALT); //para que sea numero
      return await this.userRepository.save(body);
    } catch (error) {
      throw new Error(error);
    }
  }

  public async findUsers(): Promise<UserEntity[]> {
    try {
      const users: UserEntity[] = await this.userRepository.find();

      if (users.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontraron usuarios',
        });
      }

      return users;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findUserById(id: string): Promise<UserEntity> {
    try {
      // customizar la consulta
      const user: UserEntity = await this.userRepository
        .createQueryBuilder('user')
        .where({ id })
        .leftJoinAndSelect('user.companyIncludes', 'companyIncludes')
        .leftJoinAndSelect('companyIncludes.company', 'company')
        .getOne();

      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se econtro usuario con el id: ' + id,
        });
      }

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateUser(
    body: UserUpdateDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const user: UpdateResult = await this.userRepository.update(id, body);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar el usuario id: ' + id,
        });
      }

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteUser(id: string): Promise<DeleteResult | undefined> {
    try {
      const user = await this.userRepository.delete(id);
      if (user.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar el usuario id: ' + id,
        });
      }

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Relation with company
  public async relationToCompany(body: UserToCompanyCreateDTO) {
    const { userId, companyId, accessLevel } = body;
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      // Verificar si la empresa existe
      const company = await this.companyRepository.findOne({
        where: { id: companyId },
      });
      if (!company) {
        throw new NotFoundException(`Company with id ${companyId} not found`);
      }

      // Crear la relación usuario-empresa
      const userCompany = this.userCompanyRepository.create({
        user,
        company,
        accessLevel,
      });

      return await this.userCompanyRepository.save(userCompany);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // find By
  public async findBy({
    key,
    value,
  }: {
    key: keyof UserCreateDTO;
    value: any;
  }) {
    try {
      const user: UserEntity = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where({ [key]: value })
        .getOne();

      return user;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
  public async findUserCompanies(userId: string): Promise<CompanyEntity[]> {
    try {
      const user = await this.userRepository
        .createQueryBuilder('user')
        .where({ id: userId })
        .leftJoinAndSelect('user.companyIncludes', 'companyIncludes')
        .leftJoinAndSelect('companyIncludes.company', 'company')
        .getOne();

      // Si no se encuentra el usuario, lanzar un error
      if (!user) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontró el usuario',
        });
      }

      // Si el usuario no tiene empresas asociadas, retornar un array vacío
      if (user.companyIncludes.length === 0) {
        return []; // Retornar un array vacío en lugar de lanzar un error
      }

      // Retornar solo las empresas a las que pertenece el usuario
      return user.companyIncludes.map((include) => include.company);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
