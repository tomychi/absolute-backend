import { Entity, Column, BeforeInsert, BeforeUpdate, OneToMany } from 'typeorm';
import {
  IsEmail,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { BaseEntity } from '../../../config/base.entity';
import { UserCompany } from '../../../modules/user-companies/entities/user-company.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @Column()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ name: 'first_name' })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @Column({ name: 'last_name', nullable: true })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @Matches(/^[+]?[1-9][\d]{0,15}$/, {
    message: 'Phone must be a valid phone number',
  })
  phone?: string;

  @Column({ name: 'is_active', default: true })
  @IsBoolean({ message: 'Is active must be a boolean' })
  isActive: boolean;

  @Column({ name: 'last_login', nullable: true })
  lastLogin?: Date;

  @Column({ name: 'password_reset_token', nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordResetToken?: string;

  @Column({ name: 'password_reset_expires', nullable: true })
  @Exclude({ toPlainOnly: true })
  passwordResetExpires?: Date;

  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'email_verification_token', nullable: true })
  @Exclude({ toPlainOnly: true })
  emailVerificationToken?: string;

  // Security field for refresh token versioning
  @Column({ name: 'token_version', default: 0 })
  @Exclude({ toPlainOnly: true })
  tokenVersion: number;

  @OneToMany(() => UserCompany, (userCompany) => userCompany.user, {
    cascade: true,
  })
  userCompanies: UserCompany[];

  // Methods
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password && !this.password.startsWith('$2')) {
      // Only hash if password is not already hashed
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const {
      password,
      passwordResetToken,
      passwordResetExpires,
      emailVerificationToken,
      tokenVersion,
      ...result
    } = this;
    void password;
    void passwordResetToken;
    void passwordResetExpires;
    void emailVerificationToken;
    void tokenVersion;
    return result;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName || ''}`.trim();
  }

  // Method to increment token version (for logout all devices)
  incrementTokenVersion(): void {
    this.tokenVersion += 1;
  }
}
