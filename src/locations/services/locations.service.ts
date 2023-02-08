import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocationsEntity } from '../entities/locations.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { LocationDTO, LocationUpdateDTO } from '../dto/location.dto';
import { ErrorManager } from 'src/utils/error.manager';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(LocationsEntity)
    private readonly locationRepository: Repository<LocationsEntity>,
  ) {}

  public async createLocation(body: LocationDTO): Promise<LocationsEntity> {
    try {
      return await this.locationRepository.save(body);
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
}
