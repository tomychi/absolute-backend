export const STOCK_MOVEMENT_TYPES = [
  {
    name: 'venta',
    description: 'Salida por venta',
    isAddition: false,
  },
  {
    name: 'compra',
    description: 'Entrada por compra',
    isAddition: true,
  },
  {
    name: 'ajuste',
    description: 'Ajuste de stock',
    isAddition: true,
  },
  {
    name: 'devolución',
    description: 'Devolución de producto',
    isAddition: true,
  },
  {
    name: 'cierre',
    description: 'Salida por cierre de inventario',
    isAddition: false,
  },
  {
    name: 'carga_inicial',
    description: 'Carga inicial de stock',
    isAddition: true,
  },
];
