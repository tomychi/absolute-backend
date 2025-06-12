import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateStockMovementDto,
  CreateStockMovementTypeDto,
  FilterStockMovementsDto,
} from '../dto/stock.dto';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { StockMovementEntity } from '../entities/stockMovement.entity';
import { InventoryEntity } from '../../inventory/entities/inventory.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { StockMovementTypeEntity } from '../entities/stockMovementType.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovementEntity)
    private readonly stockMovementRepo: Repository<StockMovementEntity>,

    @InjectRepository(StockMovementTypeEntity)
    private readonly movementTypeRepo: Repository<StockMovementTypeEntity>,

    @InjectRepository(BranchEntity)
    private readonly branchRepo: Repository<BranchEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,

    @InjectRepository(InventoryEntity)
    private readonly inventoryRepo: Repository<InventoryEntity>,

    @InjectRepository(ProductEntity)
    private readonly productRepo: Repository<ProductEntity>,
  ) {}

  async createMovementType(dto: CreateStockMovementTypeDto) {
    const type = this.movementTypeRepo.create(dto);
    return this.movementTypeRepo.save(type);
  }

  async createStockMovement(dto: CreateStockMovementDto) {
    const movementType = await this.movementTypeRepo.findOneByOrFail({
      name: dto.movementTypeId,
    });

    const branch = await this.branchRepo.findOneByOrFail({ id: dto.branchId });

    const user = await this.userRepo.findOneByOrFail({ id: dto.userId });

    // Encontramos el producto
    const product = await this.productRepo.findOneByOrFail({
      id: dto.productId,
    });

    // Buscamos el inventario para este producto y sucursal
    let inventory = await this.inventoryRepo.findOne({
      where: { product: { id: dto.productId }, branch: { id: dto.branchId } },
    });

    // Si no existe, lo creamos
    if (!inventory) {
      inventory = this.inventoryRepo.create({
        stock: 0,
        product,
        branch,
      });
    }

    inventory.stock += movementType.isAddition ? dto.quantity : -dto.quantity;
    // Guardamos el inventario actualizado
    await this.inventoryRepo.save(inventory);

    // Creamos el movimiento de stock
    const movement = this.stockMovementRepo.create({
      quantity: dto.quantity,
      reference: dto.reference,
      note: dto.note,
      movementType,
      branch,
      user,
      product,
    });

    // Guardamos el movimiento
    return this.stockMovementRepo.save(movement);
  }

  async createMultipleStockMovements(movements: CreateStockMovementDto[]) {
    const results = [];

    for (const movement of movements) {
      const result = await this.createStockMovement(movement);
      results.push(result);
    }

    return results;
  }

  async getStockMovements(filter: FilterStockMovementsDto) {
    return this.stockMovementRepo.find({
      where: {
        branch: {
          company: { id: filter.companyId },
        },
      },
      relations: ['product', 'branch', 'user', 'movementType'],
      order: { createdAt: 'DESC' },
    });
  }
}
