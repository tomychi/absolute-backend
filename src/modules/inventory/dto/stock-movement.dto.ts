import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import {
  StockMovement,
  StockMovementType,
} from '../entities/stock-movement.entity';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { BranchResponseDto } from '../../branches/dto/branch-response.dto';
import { ProductResponseDto } from '../../products/dto/product-response.dto';

export class CreateStockMovementDto {
  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  @IsUUID(4, { message: 'Branch ID must be a valid UUID' })
  branchId: string;

  @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({
    example: 50.5,
    description: 'Quantity (positive for in, negative for out)',
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Quantity must be a valid number with max 2 decimal places' },
  )
  quantity: number;

  @ApiProperty({
    example: 'purchase',
    description: 'Movement type',
    enum: StockMovementType,
  })
  @IsEnum(StockMovementType, {
    message: 'Type must be a valid stock movement type',
  })
  type: StockMovementType;

  @ApiPropertyOptional({
    example: 'uuid-reference-id',
    description: 'Reference ID (invoice, transfer, etc.)',
  })
  @IsOptional()
  @IsUUID(4, { message: 'Reference ID must be a valid UUID' })
  referenceId?: string;

  @ApiPropertyOptional({
    example: 'Purchase from supplier ABC',
    description: 'Movement notes',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({ example: 89.99, description: 'Cost per unit' })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Cost per unit must be a valid number' },
  )
  @Min(0, { message: 'Cost per unit must be greater than or equal to 0' })
  costPerUnit?: number;
}

export class StockMovementResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Movement ID' })
  id: string;

  @ApiProperty({ example: 'uuid-branch-id', description: 'Branch ID' })
  branchId: string;

  @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
  productId: string;

  @ApiProperty({ example: 'uuid-user-id', description: 'User ID' })
  userId: string;

  @ApiProperty({ example: 50.5, description: 'Quantity moved' })
  quantity: number;

  @ApiProperty({ example: 50.5, description: 'Absolute quantity moved' })
  absoluteQuantity: number;

  @ApiProperty({
    example: 'purchase',
    description: 'Movement type',
    enum: StockMovementType,
  })
  type: StockMovementType;

  @ApiProperty({
    example: 'Purchase',
    description: 'Movement type display name',
  })
  typeDisplayName: string;

  @ApiProperty({ example: true, description: 'Whether movement is inbound' })
  isInbound: boolean;

  @ApiProperty({ example: false, description: 'Whether movement is outbound' })
  isOutbound: boolean;

  @ApiPropertyOptional({
    example: 'uuid-reference-id',
    description: 'Reference ID',
  })
  referenceId?: string;

  @ApiPropertyOptional({
    example: 'Purchase from supplier ABC',
    description: 'Movement notes',
  })
  notes?: string;

  @ApiPropertyOptional({ example: 89.99, description: 'Cost per unit' })
  costPerUnit?: number;

  @ApiPropertyOptional({ example: 4499.5, description: 'Total cost' })
  totalCost?: number;

  @ApiPropertyOptional({ example: 100.0, description: 'Previous quantity' })
  previousQuantity?: number;

  @ApiPropertyOptional({
    example: 150.5,
    description: 'New quantity after movement',
  })
  newQuantity?: number;

  @ApiProperty({
    example: 'Added 50.5 units - Purchase',
    description: 'Movement description',
  })
  movementDescription: string;

  @ApiProperty({
    example: '2024-07-26T15:30:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Branch information',
    type: BranchResponseDto,
  })
  branch?: BranchResponseDto;

  @ApiPropertyOptional({
    description: 'Product information',
    type: ProductResponseDto,
  })
  product?: ProductResponseDto;

  @ApiPropertyOptional({
    description: 'User information',
    type: UserResponseDto,
  })
  user?: UserResponseDto;

  // Static method to transform StockMovement entity to DTO
  static fromEntity(movement: StockMovement): StockMovementResponseDto {
    return {
      id: movement.id,
      branchId: movement.branchId,
      productId: movement.productId,
      userId: movement.userId,
      quantity: Number(movement.quantity),
      absoluteQuantity: movement.absoluteQuantity,
      type: movement.type,
      typeDisplayName: movement.typeDisplayName,
      isInbound: movement.isInbound,
      isOutbound: movement.isOutbound,
      referenceId: movement.referenceId,
      notes: movement.notes,
      costPerUnit: movement.costPerUnit
        ? Number(movement.costPerUnit)
        : undefined,
      totalCost: movement.totalCost ? Number(movement.totalCost) : undefined,
      previousQuantity: movement.previousQuantity
        ? Number(movement.previousQuantity)
        : undefined,
      newQuantity: movement.newQuantity
        ? Number(movement.newQuantity)
        : undefined,
      movementDescription: movement.movementDescription,
      createdAt: movement.createdAt,
      branch: movement.branch
        ? BranchResponseDto.fromEntity(movement.branch)
        : undefined,
      product: movement.product
        ? ProductResponseDto.fromEntity(movement.product)
        : undefined,
      user: movement.user
        ? UserResponseDto.fromEntity(movement.user)
        : undefined,
    };
  }
}
