// src/database/seeds/seed-stock-movement-types.ts
import { DataSource } from 'typeorm';
import { STOCK_MOVEMENT_TYPES } from './stock-movement-types.seed';
import { StockMovementTypeEntity } from '../stock/entities/stockMovementType.entity';

export async function seedStockMovementTypes(dataSource: DataSource) {
  const repo = dataSource.getRepository(StockMovementTypeEntity);

  for (const type of STOCK_MOVEMENT_TYPES) {
    const exists = await repo.findOneBy({ name: type.name });
    if (!exists) {
      const newType = repo.create(type);
      await repo.save(newType);
    }
  }

  console.log('✔️ Tipos de movimiento de stock cargados');
}
