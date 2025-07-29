import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  StockTransfer,
  StockTransferStatus,
} from '../entities/stock-transfer.entity';
import { BranchResponseDto } from '../../branches/dto/branch-response.dto';
import { ProductResponseDto } from '../../products/dto/product-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { StockTransferItem } from '../entities/stock-transfer-item.entity';

export class StockTransferItemDto {
  @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
  @IsUUID(4, { message: 'Product ID must be a valid UUID' })
  productId: string;

  @ApiProperty({ example: 25.5, description: 'Quantity to transfer' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Quantity must be a valid number' },
  )
  @Min(0.01, { message: 'Quantity must be greater than 0' })
  quantity: number;

  @ApiPropertyOptional({
    example: 89.99,
    description: 'Unit cost for valuation',
  })
  @IsOptional()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Unit cost must be a valid number' },
  )
  @Min(0, { message: 'Unit cost must be greater than or equal to 0' })
  unitCost?: number;
}

export class CreateStockTransferDto {
  @ApiProperty({
    example: 'uuid-from-branch-id',
    description: 'Source branch ID',
  })
  @IsUUID(4, { message: 'From branch ID must be a valid UUID' })
  fromBranchId: string;

  @ApiProperty({
    example: 'uuid-to-branch-id',
    description: 'Destination branch ID',
  })
  @IsUUID(4, { message: 'To branch ID must be a valid UUID' })
  toBranchId: string;

  @ApiProperty({
    description: 'Items to transfer',
    type: [StockTransferItemDto],
  })
  @IsArray({ message: 'Items must be an array' })
  @ValidateNested({ each: true })
  @Type(() => StockTransferItemDto)
  items: StockTransferItemDto[];

  @ApiPropertyOptional({
    example: '2024-07-26T15:30:00Z',
    description: 'Transfer date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Transfer date must be a valid date' })
  transferDate?: string;

  @ApiPropertyOptional({
    example: 'Transfer for new store opening',
    description: 'Transfer notes',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;
}

export class UpdateStockTransferDto {
  @ApiPropertyOptional({
    example: 'Transfer updated with new items',
    description: 'Updated notes',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  @MaxLength(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @ApiPropertyOptional({
    example: '2024-07-26T16:00:00Z',
    description: 'Updated transfer date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Transfer date must be a valid date' })
  transferDate?: string;
}

export class StockTransferItemResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Transfer item ID' })
  id: string;

  @ApiProperty({ example: 'uuid-product-id', description: 'Product ID' })
  productId: string;

  @ApiProperty({ example: 25.5, description: 'Quantity transferred' })
  quantity: number;

  @ApiPropertyOptional({ example: 89.99, description: 'Unit cost' })
  unitCost?: number;

  @ApiProperty({ example: 2299.75, description: 'Total cost for this item' })
  totalCost: number;

  @ApiProperty({
    example: '25.5 x Laptop Dell Inspiron',
    description: 'Item summary',
  })
  itemSummary: string;

  @ApiPropertyOptional({
    description: 'Product information',
    type: ProductResponseDto,
  })
  product?: ProductResponseDto;

  static fromEntity(item: StockTransferItem): StockTransferItemResponseDto {
    return {
      id: item.id,
      productId: item.productId,
      quantity: Number(item.quantity),
      unitCost: item.unitCost ? Number(item.unitCost) : undefined,
      totalCost: item.totalCost,
      itemSummary: item.itemSummary,
      product: item.product
        ? ProductResponseDto.fromEntity(item.product)
        : undefined,
    };
  }
}

export class StockTransferResponseDto {
  @ApiProperty({ example: 'uuid-here', description: 'Transfer ID' })
  id: string;

  @ApiProperty({
    example: 'uuid-from-branch-id',
    description: 'Source branch ID',
  })
  fromBranchId: string;

  @ApiProperty({
    example: 'uuid-to-branch-id',
    description: 'Destination branch ID',
  })
  toBranchId: string;

  @ApiProperty({
    example: 'uuid-user-id',
    description: 'User who created transfer',
  })
  userId: string;

  @ApiProperty({
    example: 'pending',
    description: 'Transfer status',
    enum: StockTransferStatus,
  })
  status: StockTransferStatus;

  @ApiProperty({
    example: 'Pending',
    description: 'Transfer status display name',
  })
  statusDisplayName: string;

  @ApiProperty({
    example: '2024-07-26T15:30:00Z',
    description: 'Transfer date',
  })
  transferDate: Date;

  @ApiPropertyOptional({
    example: '2024-07-26T16:30:00Z',
    description: 'Completion date',
  })
  completedDate?: Date;

  @ApiPropertyOptional({
    example: 'uuid-completed-by',
    description: 'User who completed transfer',
  })
  completedBy?: string;

  @ApiPropertyOptional({
    example: 'Transfer for new store opening',
    description: 'Transfer notes',
  })
  notes?: string;

  @ApiProperty({ example: 5, description: 'Total number of items' })
  totalItems: number;

  @ApiProperty({ example: 125.5, description: 'Total quantity transferred' })
  totalQuantity: number;

  @ApiProperty({ example: 11289.45, description: 'Total transfer value' })
  totalValue: number;

  @ApiProperty({
    example: true,
    description: 'Whether transfer can be cancelled',
  })
  canBeCancelled: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether transfer can be completed',
  })
  canBeCompleted: boolean;

  @ApiProperty({
    example: 'Transfer from Main Store to Branch A - 5 items',
    description: 'Transfer summary',
  })
  transferSummary: string;

  @ApiProperty({
    example: '2024-07-26T15:30:00Z',
    description: 'Creation date',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-07-26T15:30:00Z',
    description: 'Last update date',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Source branch information',
    type: BranchResponseDto,
  })
  fromBranch?: BranchResponseDto;

  @ApiPropertyOptional({
    description: 'Destination branch information',
    type: BranchResponseDto,
  })
  toBranch?: BranchResponseDto;

  @ApiPropertyOptional({
    description: 'User who created transfer',
    type: UserResponseDto,
  })
  user?: UserResponseDto;

  @ApiPropertyOptional({
    description: 'User who completed transfer',
    type: UserResponseDto,
  })
  completedByUser?: UserResponseDto;

  @ApiPropertyOptional({
    description: 'Transfer items',
    type: [StockTransferItemResponseDto],
  })
  items?: StockTransferItemResponseDto[];

  static fromEntity(transfer: StockTransfer): StockTransferResponseDto {
    return {
      id: transfer.id,
      fromBranchId: transfer.fromBranchId,
      toBranchId: transfer.toBranchId,
      userId: transfer.userId,
      status: transfer.status,
      statusDisplayName: transfer.statusDisplayName,
      transferDate: transfer.transferDate,
      completedDate: transfer.completedDate,
      completedBy: transfer.completedBy,
      notes: transfer.notes,
      totalItems: transfer.totalItems,
      totalQuantity: transfer.totalQuantity,
      totalValue: transfer.totalValue,
      canBeCancelled: transfer.canBeCancelled,
      canBeCompleted: transfer.canBeCompleted,
      transferSummary: transfer.transferSummary,
      createdAt: transfer.createdAt,
      updatedAt: transfer.updatedAt,
      fromBranch: transfer.fromBranch
        ? BranchResponseDto.fromEntity(transfer.fromBranch)
        : undefined,
      toBranch: transfer.toBranch
        ? BranchResponseDto.fromEntity(transfer.toBranch)
        : undefined,
      user: transfer.user
        ? UserResponseDto.fromEntity(transfer.user)
        : undefined,
      completedByUser: transfer.completedByUser
        ? UserResponseDto.fromEntity(transfer.completedByUser)
        : undefined,
      items: transfer.items
        ? transfer.items.map((item: any) =>
            StockTransferItemResponseDto.fromEntity(item),
          )
        : undefined,
    };
  }
}
