import { Entity, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import {
  IsString,
  IsBoolean,
  IsOptional,
  IsEmail,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { BaseEntity } from '../../../config/base.entity';

@Entity('companies')
export class Company extends BaseEntity {
  @Column()
  @IsString({ message: 'Company name must be a string' })
  @MinLength(2, { message: 'Company name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Company name must not exceed 100 characters' })
  name: string;

  @Column({ name: 'tax_id', unique: true, nullable: true })
  @IsOptional()
  @IsString({ message: 'Tax ID must be a string' })
  @MaxLength(50, { message: 'Tax ID must not exceed 50 characters' })
  taxId?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  @MaxLength(500, { message: 'Address must not exceed 500 characters' })
  address?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone must not exceed 20 characters' })
  phone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @Column({ name: 'is_active', default: true })
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Future relations will be added here
  // @OneToMany(() => UserCompany, userCompany => userCompany.company)
  // userCompanies: UserCompany[];

  // @OneToMany(() => Branch, branch => branch.company)
  // branches: Branch[];

  // @OneToMany(() => Product, product => product.company)
  // products: Product[];

  // Helper methods
  get displayName(): string {
    return this.name;
  }

  get isValidForOperations(): boolean {
    return this.isActive && !!this.name;
  }

  // Method to get company info for public display
  getPublicInfo() {
    return {
      id: this.id,
      name: this.name,
      website: this.website,
      description: this.description,
      isActive: this.isActive,
    };
  }

  // Method to get full company details (for members)
  getFullInfo() {
    return {
      id: this.id,
      name: this.name,
      taxId: this.taxId,
      address: this.address,
      phone: this.phone,
      email: this.email,
      website: this.website,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
