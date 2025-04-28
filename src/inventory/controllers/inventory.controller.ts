import { Body, Controller, Post } from '@nestjs/common';
import { InventoryService } from '../services/inventory.service';
import { InventoryEntity } from '../entities/inventory.entity';
import { InventoryCreateDTO } from '../dto/inventory.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async createInventory(
    @Body() inventoryCreateDTO: InventoryCreateDTO,
  ): Promise<InventoryEntity> {
    return this.inventoryService.createInventory(inventoryCreateDTO);
  }
}
