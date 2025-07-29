-- Inventario actual por sucursal
inventory {
  id: uuid
  branch_id: uuid (FK → branches.id)
  product_id: uuid (FK → products.id)
  quantity: decimal(10,2)
  reserved_quantity: decimal(10,2) -- Para órdenes pendientes
  available_quantity: decimal(10,2) -- quantity - reserved_quantity
  last_updated: timestamp
}

-- Historial de movimientos
stock_movements {
  id: uuid
  branch_id: uuid (FK → branches.id)
  product_id: uuid (FK → products.id)
  user_id: uuid (FK → users.id)
  quantity: decimal(10,2) -- Positivo = entrada, Negativo = salida
  type: enum ('purchase', 'sale', 'adjustment', 'transfer_in', 'transfer_out', 'return')
  reference_id: uuid -- ID de factura, transferencia, etc.
  notes: text
  cost_per_unit: decimal(12,2) -- Para valorización
  total_cost: decimal(12,2)
  created_at: timestamp
}

-- Transferencias entre sucursales
stock_transfers {
  id: uuid
  from_branch_id: uuid (FK → branches.id)
  to_branch_id: uuid (FK → branches.id)
  user_id: uuid (FK → users.id)
  status: enum ('pending', 'in_transit', 'completed', 'cancelled')
  transfer_date: timestamp
  completed_date: timestamp
  notes: text
}

-- Items de transferencia
stock_transfer_items {
  id: uuid
  transfer_id: uuid (FK → stock_transfers.id)
  product_id: uuid (FK → products.id)
  quantity: decimal(10,2)
  unit_cost: decimal(12,2)
}
