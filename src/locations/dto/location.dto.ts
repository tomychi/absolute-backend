import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { CompaniesEntity } from '../../companies/entities/companies.entity';
import { LocationsEntity } from '../entities/locations.entity';
import { ProductsEntity } from '../../products/entities/products.entity';

export class LocationDTO {
  @IsNotEmpty()
  @IsString()
  province: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsNotEmpty()
  @IsUUID()
  companyId: CompaniesEntity;
}

export class LocationUpdateDTO {
  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  image?: string;
}
/**
 *
 * province
 * city
 * address
 * phone
 *
 *
 *
 * relacion usuario
 */
export class LocationToProductDTO {
  @IsNotEmpty()
  @IsUUID()
  location: LocationsEntity;

  @IsNotEmpty()
  @IsUUID()
  product: ProductsEntity;

  @IsNotEmpty()
  @IsNumber()
  stock: number;
}
