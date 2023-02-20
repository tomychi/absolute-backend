import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationsEntity } from '../entities/locations.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import {
  LocationDTO,
  LocationToProductDTO,
  LocationUpdateDTO,
} from '../dto/location.dto';
import { ErrorManager } from 'src/utils/error.manager';
import { CompaniesEntity } from '../../companies/entities/companies.entity';
import { LocationsProductsEntity } from '../entities/locationsProducts.entity';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationsEntity)
    private readonly locationRepository: Repository<LocationsEntity>,

    @InjectRepository(CompaniesEntity)
    private readonly companyRepository: Repository<CompaniesEntity>,

    @InjectRepository(LocationsProductsEntity)
    private readonly locationProductRepository: Repository<LocationsProductsEntity>,
  ) {}

  public async createLocation(body: LocationDTO): Promise<LocationsEntity> {
    try {
      const id = body.companyId;
      const company = await this.companyRepository
        .createQueryBuilder('company')
        .where({ id })
        .getOne();

      if (!company) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontro empresa con el id: ' + id,
        });
      }
      const location = this.locationRepository.create({
        ...body,
        company: company,
      });
      return await this.locationRepository.save(location);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findLocations(): Promise<LocationsEntity[]> {
    try {
      const locations: LocationsEntity[] = await this.locationRepository.find();

      if (locations.length === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se encontraron sucursales',
        });
      }

      return locations;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findLocationById(id: string): Promise<LocationsEntity> {
    try {
      // customizar la consulta
      const location: LocationsEntity = await this.locationRepository
        .createQueryBuilder('location')
        .where({ id })
        .leftJoinAndSelect('location.productsIncludes', 'productsIncludes')
        .leftJoinAndSelect('productsIncludes.product', 'product')
        .getOne();

      if (!location) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se econtro sucursal con el id: ' + id,
        });
      }

      return location;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateLocation(
    body: LocationUpdateDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const location: UpdateResult = await this.locationRepository.update(
        id,
        body,
      );
      if (location.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar la sucursal id: ' + id,
        });
      }

      return location;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async deleteLocation(id: string): Promise<DeleteResult> {
    try {
      const location: DeleteResult = await this.locationRepository.delete(id);
      if (location.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo borrar la sucursal id: ' + id,
        });
      }

      return location;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  // Relation with product
  public async relationToProduct(body: LocationToProductDTO) {
    try {
      return await this.locationProductRepository.save(body);
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async updateRelationToProduct(
    body: LocationToProductDTO,
    id: string,
  ): Promise<UpdateResult> {
    try {
      const result = await this.locationProductRepository.update(id, body);
      if (result.affected === 0) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se pudo actualizar el producto id: ' + id,
        });
      }

      return result;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }

  public async findLocationByProduct(
    id: string,
    productId: string,
  ): Promise<LocationsEntity> {
    try {
      // customizar la consulta
      const location: LocationsEntity = await this.locationRepository
        .createQueryBuilder('location')
        .where({ id })
        .leftJoinAndSelect('location.productsIncludes', 'productsIncludes')
        .leftJoinAndSelect('productsIncludes.product', 'product')
        .andWhere('product.id = :productId', { productId })
        .getOne();

      if (!location) {
        throw new ErrorManager({
          type: 'BAD_REQUEST',
          message: 'No se el producto en la sucursal con el id: ' + productId,
        });
      }

      return location;
    } catch (error) {
      throw ErrorManager.createSignatureError(error.message);
    }
  }
}
