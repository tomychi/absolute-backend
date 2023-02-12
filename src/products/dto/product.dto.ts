import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductDTO {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  image: string;
}

export class ProductUpdateDTO {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  image: string;
}
