import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class ProductCreateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  upc: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sku: string;
}

export class ProductUpdateDTO {
  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @MinLength(3)
  description?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  price?: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  upc?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  sku?: string;
}
