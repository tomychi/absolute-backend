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
  IsBoolean,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDecimal,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';
import { BaseEntity } from '../../../config/base.entity';

export enum BranchType {
  RETAIL = 'retail',
  WAREHOUSE = 'warehouse',
  OFFICE = 'office',
  VIRTUAL = 'virtual',
  DISTRIBUTION = 'distribution',
}

export interface BusinessHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  open: string; // HH:mm format
  close: string; // HH:mm format
  closed: boolean;
}

@Entity('branches')
@Unique(['companyId', 'code']) // Code must be unique per company
@Index(['companyId', 'isActive'])
@Index(['companyId', 'type'])
export class Branch extends BaseEntity {
  @Column()
  @IsString({ message: 'Branch name must be a string' })
  @MinLength(2, { message: 'Branch name must be at least 2 characters long' })
  @MaxLength(100, { message: 'Branch name must not exceed 100 characters' })
  name: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ length: 20 })
  @IsString({ message: 'Branch code must be a string' })
  @MinLength(2, { message: 'Branch code must be at least 2 characters long' })
  @MaxLength(20, { message: 'Branch code must not exceed 20 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message:
      'Branch code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code: string;

  @Column({
    type: 'enum',
    enum: BranchType,
    default: BranchType.RETAIL,
  })
  @IsEnum(BranchType, { message: 'Type must be a valid branch type' })
  type: BranchType;

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

  @Column({ name: 'manager_id', nullable: true })
  @IsOptional()
  managerId?: string;

  @Column({ name: 'is_active', default: true })
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive: boolean;

  @Column({ name: 'is_main', default: false })
  @IsBoolean({ message: 'Is main must be a boolean' })
  isMain: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  @IsOptional()
  @IsDecimal({}, { message: 'Latitude must be a valid decimal number' })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  @IsOptional()
  @IsDecimal({}, { message: 'Longitude must be a valid decimal number' })
  longitude?: number;

  @Column({
    name: 'business_hours',
    type: 'json',
    nullable: true,
  })
  @IsOptional()
  businessHours?: BusinessHours;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  // Future relations will be added here
  // @OneToMany(() => Inventory, inventory => inventory.branch)
  // inventory: Inventory[];

  // @OneToMany(() => Invoice, invoice => invoice.branch)
  // invoices: Invoice[];

  // @OneToMany(() => UserBranch, userBranch => userBranch.branch)
  // userBranches: UserBranch[];

  // Helper methods
  get displayName(): string {
    return `${this.name} (${this.code})`;
  }

  get fullAddress(): string {
    return this.address || 'No address specified';
  }

  get isOperational(): boolean {
    return (
      this.isActive &&
      (this.type === BranchType.RETAIL || this.type === BranchType.WAREHOUSE)
    );
  }

  get coordinates(): { lat: number; lng: number } | null {
    if (this.latitude && this.longitude) {
      return {
        lat: Number(this.latitude),
        lng: Number(this.longitude),
      };
    }
    return null;
  }

  // Method to check if branch is open at specific time
  isOpenAt(dayOfWeek: keyof BusinessHours, time: string): boolean {
    if (!this.businessHours) return true; // Assume open if no hours specified

    const daySchedule = this.businessHours[dayOfWeek];
    if (daySchedule.closed) return false;

    const timeMinutes = this.timeToMinutes(time);
    const openMinutes = this.timeToMinutes(daySchedule.open);
    const closeMinutes = this.timeToMinutes(daySchedule.close);

    return timeMinutes >= openMinutes && timeMinutes <= closeMinutes;
  }

  // Method to check if branch is currently open
  isCurrentlyOpen(): boolean {
    if (!this.businessHours) return true;

    const now = new Date();
    const dayNames: (keyof BusinessHours)[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = dayNames[now.getDay()];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    return this.isOpenAt(currentDay, currentTime);
  }

  // Method to get default business hours
  static getDefaultBusinessHours(): BusinessHours {
    return {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '00:00', close: '00:00', closed: true },
    };
  }

  // Method to get branch type display name
  get typeDisplayName(): string {
    const typeNames = {
      [BranchType.RETAIL]: 'Retail Store',
      [BranchType.WAREHOUSE]: 'Warehouse',
      [BranchType.OFFICE]: 'Office',
      [BranchType.VIRTUAL]: 'Virtual Store',
      [BranchType.DISTRIBUTION]: 'Distribution Center',
    };
    return typeNames[this.type] || this.type;
  }

  // Method to generate branch code suggestion
  static generateCodeSuggestion(
    companyName: string,
    branchName: string,
  ): string {
    const companyCode = companyName.substring(0, 2).toUpperCase();
    const branchCode = branchName.substring(0, 3).toUpperCase();
    const random = Math.floor(Math.random() * 99)
      .toString()
      .padStart(2, '0');
    return `${companyCode}${branchCode}${random}`;
  }

  // Private helper method
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Method to get summary info
  getSummary() {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      type: this.type,
      isActive: this.isActive,
      isMain: this.isMain,
      managerName: this.manager?.fullName,
      address: this.address,
      isCurrentlyOpen: this.isCurrentlyOpen(),
    };
  }
}
