import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, ILike } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { User } from '../entities/user.entity';
import { plainToClass } from 'class-transformer';

interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
  sortBy?: keyof User;
  sortOrder?: 'ASC' | 'DESC';
}

interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    // Check if email already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create new user
    const user = this.userRepository.create(createUserDto);

    try {
      const savedUser = await this.userRepository.save(user);
      return UserResponseDto.fromEntity(savedUser);
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Find all users with pagination and filtering
   */
  async findAll(
    options: PaginationOptions,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const {
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const skip = (page - 1) * limit;

    // Build where conditions
    const where: FindOptionsWhere<User>[] = [];

    if (search) {
      where.push(
        { firstName: ILike(`%${search}%`) },
        { lastName: ILike(`%${search}%`) },
        { email: ILike(`%${search}%`) },
      );
    }

    // If no search, get all users
    if (where.length === 0) {
      where.push({});
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => UserResponseDto.fromEntity(user)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Find one user by ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromEntity(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find user with full profile (can be extended for relations)
   */
  async findByEmailWithCompanies(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: [
        'userCompanies',
        'userCompanies.company',
        'userCompanies.accessLevel',
      ],
    });
  }

  /**
   * Find user with full profile (can be extended for relations)
   */
  async findOneWithProfile(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
      // Add relations here when you add them
      relations: ['userCompanies', 'userCompanies.company'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return plainToClass(UserResponseDto, user);
  }

  /**
   * Update user
   */
  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being updated and already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    // Merge the updates
    Object.assign(user, updateUserDto);

    try {
      const updatedUser = await this.userRepository.save(user);
      return plainToClass(UserResponseDto, updatedUser);
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Change user password
   */
  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate current password
    const isCurrentPasswordValid = await user.validatePassword(
      changePasswordDto.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to change password');
    }
  }

  /**
   * Toggle user active status
   */
  async toggleStatus(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isActive = !user.isActive;

    try {
      const updatedUser = await this.userRepository.save(user);
      return plainToClass(UserResponseDto, updatedUser);
    } catch (error) {
      throw new BadRequestException('Failed to update user status');
    }
  }

  /**
   * Soft delete user (deactivate)
   */
  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete by deactivating the user
    user.isActive = false;

    try {
      await this.userRepository.save(user);
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Hard delete user (for admin purposes - use with caution)
   */
  async hardDelete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  /**
   * Find active users only
   */
  async findActiveUsers(
    options: PaginationOptions,
  ): Promise<PaginatedResult<UserResponseDto>> {
    const {
      page,
      limit,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const skip = (page - 1) * limit;

    // Build where conditions for active users only
    const where: FindOptionsWhere<User>[] = [];
    const baseCondition = { isActive: true };

    if (search) {
      where.push(
        { ...baseCondition, firstName: ILike(`%${search}%`) },
        { ...baseCondition, lastName: ILike(`%${search}%`) },
        { ...baseCondition, email: ILike(`%${search}%`) },
      );
    } else {
      where.push(baseCondition);
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: users.map((user) => plainToClass(UserResponseDto, user)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    await this.userRepository.update(id, {
      lastLogin: new Date(),
    });
  }

  /**
   * Increment token version (for logout all devices)
   */
  async incrementTokenVersion(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.incrementTokenVersion();
    await this.userRepository.save(user);
  }

  /**
   * Set password reset token
   */
  async setPasswordResetToken(
    email: string,
    token: string,
    expiresAt: Date,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.passwordResetToken = token;
    user.passwordResetExpires = expiresAt;

    await this.userRepository.save(user);
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;

    const updatedUser = await this.userRepository.save(user);
    return plainToClass(UserResponseDto, updatedUser);
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
  }> {
    const [total, active, verified] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { isActive: true } }),
      this.userRepository.count({ where: { emailVerified: true } }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      verified,
      unverified: total - verified,
    };
  }
}
