import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  IsBoolean,
  ValidateNested,
} from 'class-validator';

export class CreateStockMovementDto {
  @IsUUID()
  branchId: string;

  @IsString() // en un futuro cambiar a uuid
  movementTypeId: string;

  @IsUUID()
  productId: string;

  @IsUUID()
  userId: string;

  @IsInt()
  quantity: number;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreateStockMovementTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  @IsNotEmpty()
  isAddition: boolean;
}

export class FilterStockMovementsDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;
}

export class CreateMultipleStockMovementsDto {
  @ValidateNested({ each: true })
  @Type(() => CreateStockMovementDto)
  movements: CreateStockMovementDto[];
}
