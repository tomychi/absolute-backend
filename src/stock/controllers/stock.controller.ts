import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { StockService } from '../services/stock.service';
import {
  CreateMultipleStockMovementsDto,
  CreateStockMovementDto,
  CreateStockMovementTypeDto,
  FilterStockMovementsDto,
} from '../dto/stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('movement-type')
  createMovementType(@Body() dto: CreateStockMovementTypeDto) {
    return this.stockService.createMovementType(dto);
  }

  @Post('movement')
  createMovement(@Body() dto: CreateStockMovementDto) {
    return this.stockService.createStockMovement(dto);
  }

  @Post('movements/bulk')
  createMultipleMovements(@Body() dto: CreateMultipleStockMovementsDto) {
    return this.stockService.createMultipleStockMovements(dto.movements);
  }

  @Get('movement')
  getStockMovements(@Query() query: FilterStockMovementsDto) {
    return this.stockService.getStockMovements(query);
  }
}
