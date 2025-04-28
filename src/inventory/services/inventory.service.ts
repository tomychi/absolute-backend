import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryEntity } from '../entities/inventory.entity';
import { ProductEntity } from '../../product/entities/product.entity';
import { BranchEntity } from '../../branch/entities/branch.entity';
import { InventoryCreateDTO } from '../dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryEntity)
    private inventoryRepository: Repository<InventoryEntity>,
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
    @InjectRepository(BranchEntity)
    private branchRepository: Repository<BranchEntity>,
  ) {}

  // Crear inventario para un producto en una sucursal
  async createInventory(
    InventoryCreateDTO: InventoryCreateDTO,
  ): Promise<InventoryEntity> {
    const { stock, productId, branchId } = InventoryCreateDTO;

    // Buscar el producto
    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new Error('Product not found');
    }

    // Buscar la sucursal
    const branch = await this.branchRepository.findOne({
      where: { id: branchId },
    });
    if (!branch) {
      throw new Error('Branch not found');
    }

    const newInventory = this.inventoryRepository.create({
      stock,
      product,
      branch,
    });

    return this.inventoryRepository.save(newInventory);
  }
}
