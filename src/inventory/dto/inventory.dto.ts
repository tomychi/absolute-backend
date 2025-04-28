import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsUUID } from 'class-validator';

export class InventoryCreateDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  stock: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  productId: string; // Relación con el producto

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  branchId: string; // Relación con la sucursal
}
