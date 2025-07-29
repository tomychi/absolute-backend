import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  IsEnum,
  MaxLength,
  MinLength,
  Min,
  Matches,
} from 'class-validator';
import { Company } from '../../companies/entities/company.entity';
import { BaseEntity } from '../../../config/base.entity';

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DISCONTINUED = 'discontinued',
  OUT_OF_STOCK = 'out_of_stock',
}

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
}

export enum ProductUnit {
  UNIT = 'unit',
  KG = 'kg',
  GRAM = 'gram',
  LITER = 'liter',
  METER = 'meter',
  SQUARE_METER = 'square_meter',
  CUBIC_METER = 'cubic_meter',
  PACK = 'pack',
  BOX = 'box',
  DOZEN = 'dozen',
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
  weight?: number;
  unit: string;
}

export interface ProductMetadata {
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  material?: string;
  warranty?: string;
  countryOfOrigin?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

@Entity('products')
@Unique(['companyId', 'sku']) // SKU must be unique per company
@Index(['companyId', 'isActive'])
@Index(['companyId', 'status'])
@Index(['companyId', 'type'])
@Index(['name'])
@Index(['sku'])
export class Product extends BaseEntity {
  @Column()
  @IsString({ message: 'Product name must be a string' })
  @MinLength(2, { message: 'Product name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Product name must not exceed 200 characters' })
  name: string;

  @Column({ name: 'company_id' })
  @IsUUID(4, { message: 'Company ID must be a valid UUID' })
  companyId: string;

  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsString({ message: 'SKU must be a string' })
  @MaxLength(50, { message: 'SKU must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message:
      'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  sku?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(2000, { message: 'Description must not exceed 2000 characters' })
  description?: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Price must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Price must be greater than or equal to 0' })
  price: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    nullable: true,
  })
  @IsOptional()
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: 'Cost must be a valid number with max 2 decimal places',
    },
  )
  @Min(0, { message: 'Cost must be greater than or equal to 0' })
  cost?: number;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.PHYSICAL,
  })
  @IsEnum(ProductType, { message: 'Type must be a valid product type' })
  type: ProductType;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  @IsEnum(ProductStatus, { message: 'Status must be a valid product status' })
  status: ProductStatus;

  @Column({
    type: 'enum',
    enum: ProductUnit,
    default: ProductUnit.UNIT,
  })
  @IsEnum(ProductUnit, { message: 'Unit must be a valid product unit' })
  unit: ProductUnit;

  @Column({ name: 'is_active', default: true })
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive: boolean;

  @Column({ name: 'track_inventory', default: true })
  @IsBoolean({ message: 'Track inventory must be a boolean' })
  trackInventory: boolean;

  @Column({ name: 'allow_backorder', default: false })
  @IsBoolean({ message: 'Allow backorder must be a boolean' })
  allowBackorder: boolean;

  @Column({ name: 'min_stock_level', default: 0 })
  @IsNumber({}, { message: 'Min stock level must be a number' })
  @Min(0, { message: 'Min stock level must be greater than or equal to 0' })
  minStockLevel: number;

  @Column({ name: 'max_stock_level', nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'Max stock level must be a number' })
  @Min(0, { message: 'Max stock level must be greater than or equal to 0' })
  maxStockLevel?: number;

  @Column({ name: 'reorder_point', default: 0 })
  @IsNumber({}, { message: 'Reorder point must be a number' })
  @Min(0, { message: 'Reorder point must be greater than or equal to 0' })
  reorderPoint: number;

  @Column({ name: 'reorder_quantity', default: 0 })
  @IsNumber({}, { message: 'Reorder quantity must be a number' })
  @Min(0, { message: 'Reorder quantity must be greater than or equal to 0' })
  reorderQuantity: number;

  @Column({
    name: 'dimensions',
    type: 'json',
    nullable: true,
  })
  @IsOptional()
  dimensions?: ProductDimensions;

  @Column({
    name: 'metadata',
    type: 'json',
    nullable: true,
  })
  @IsOptional()
  metadata?: ProductMetadata;

  @Column({ name: 'image_url', nullable: true })
  @IsOptional()
  @IsString({ message: 'Image URL must be a string' })
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  imageUrl?: string;

  @Column({ name: 'barcode', nullable: true })
  @IsOptional()
  @IsString({ message: 'Barcode must be a string' })
  @MaxLength(50, { message: 'Barcode must not exceed 50 characters' })
  barcode?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  // Future relations will be added here
  // @OneToMany(() => Inventory, inventory => inventory.product)
  // inventory: Inventory[];

  // @OneToMany(() => InvoiceItem, invoiceItem => invoiceItem.product)
  // invoiceItems: InvoiceItem[];

  // @OneToMany(() => StockMovement, stockMovement => stockMovement.product)
  // stockMovements: StockMovement[];

  // Helper methods
  get displayName(): string {
    return this.sku ? `${this.name} (${this.sku})` : this.name;
  }

  get isPhysical(): boolean {
    return this.type === ProductType.PHYSICAL;
  }

  get isDigital(): boolean {
    return this.type === ProductType.DIGITAL;
  }

  get isService(): boolean {
    return this.type === ProductType.SERVICE;
  }

  get isTracked(): boolean {
    return this.trackInventory && this.isPhysical;
  }

  get profitMargin(): number {
    if (!this.cost || this.cost === 0) return 0;
    return ((this.price - this.cost) / this.cost) * 100;
  }

  get profitAmount(): number {
    return this.price - (this.cost || 0);
  }

  get typeDisplayName(): string {
    const typeNames = {
      [ProductType.PHYSICAL]: 'Physical Product',
      [ProductType.DIGITAL]: 'Digital Product',
      [ProductType.SERVICE]: 'Service',
      [ProductType.SUBSCRIPTION]: 'Subscription',
    };
    return typeNames[this.type] || this.type;
  }

  get statusDisplayName(): string {
    const statusNames = {
      [ProductStatus.ACTIVE]: 'Active',
      [ProductStatus.INACTIVE]: 'Inactive',
      [ProductStatus.DISCONTINUED]: 'Discontinued',
      [ProductStatus.OUT_OF_STOCK]: 'Out of Stock',
    };
    return statusNames[this.status] || this.status;
  }

  get unitDisplayName(): string {
    const unitNames = {
      [ProductUnit.UNIT]: 'Unit',
      [ProductUnit.KG]: 'Kilogram',
      [ProductUnit.GRAM]: 'Gram',
      [ProductUnit.LITER]: 'Liter',
      [ProductUnit.METER]: 'Meter',
      [ProductUnit.SQUARE_METER]: 'Square Meter',
      [ProductUnit.CUBIC_METER]: 'Cubic Meter',
      [ProductUnit.PACK]: 'Pack',
      [ProductUnit.BOX]: 'Box',
      [ProductUnit.DOZEN]: 'Dozen',
    };
    return unitNames[this.unit] || this.unit;
  }

  // Method to check if product needs restock
  needsRestock(currentStock: number): boolean {
    return this.trackInventory && currentStock <= this.reorderPoint;
  }

  // Method to check if stock is low
  isLowStock(currentStock: number): boolean {
    return this.trackInventory && currentStock <= this.minStockLevel;
  }

  // Method to check if product is available for sale
  isAvailableForSale(currentStock?: number): boolean {
    if (!this.isActive || this.status !== ProductStatus.ACTIVE) {
      return false;
    }

    if (this.trackInventory && currentStock !== undefined) {
      return currentStock > 0 || this.allowBackorder;
    }

    return true;
  }

  // Method to calculate selling price with margin
  calculateSellingPrice(marginPercentage: number): number {
    if (!this.cost) return this.price;
    return this.cost * (1 + marginPercentage / 100);
  }

  // Method to generate SKU suggestion
  static generateSkuSuggestion(
    productName: string,
    companyName: string,
  ): string {
    const nameCode = productName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const companyCode = companyName
      .substring(0, 2)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');

    const random = Math.floor(Math.random() * 999)
      .toString()
      .padStart(3, '0');

    return `${companyCode}${nameCode}${random}`;
  }

  // Method to validate dimensions
  validateDimensions(): boolean {
    if (!this.dimensions) return true;

    const { length, width, height, weight } = this.dimensions;

    return (
      (!length || length > 0) &&
      (!width || width > 0) &&
      (!height || height > 0) &&
      (!weight || weight > 0)
    );
  }

  // Method to get summary info
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      sku: this.sku,
      price: this.price,
      cost: this.cost,
      type: this.type,
      status: this.status,
      unit: this.unit,
      isActive: this.isActive,
      trackInventory: this.trackInventory,
      profitMargin: this.profitMargin,
      displayName: this.displayName,
      typeDisplayName: this.typeDisplayName,
      statusDisplayName: this.statusDisplayName,
    };
  }
}
