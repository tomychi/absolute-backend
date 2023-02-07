import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LocationDTO {
  @IsNotEmpty()
  @IsString()
  province: string;

  @IsNotEmpty()
  @IsString()
  city: string;

  @IsNotEmpty()
  @IsNumber()
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class LocationUpdateDTO {
  @IsOptional()
  @IsString()
  province: string;

  @IsOptional()
  @IsString()
  city: string;

  @IsOptional()
  @IsNumber()
  address: number;

  @IsOptional()
  @IsString()
  phone: string;
}
