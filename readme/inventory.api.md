# 📊 Inventory API - Ejemplos de Testing

## 🔐 **Variables de Entorno**

```bash
# .env variables
API_BASE_URL=http://localhost:3000/api
COMPANY_ID=uuid-de-tu-empresa
BRANCH_ID=uuid-de-sucursal
PRODUCT_ID=uuid-de-producto
ACCESS_TOKEN=tu-jwt-token
```

## 📝 **1. Ver Inventario de una Sucursal**

```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory?page=1&limit=20&search=laptop&lowStock=false&sortBy=quantity&sortOrder=DESC
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": {
    "inventory": [
      {
        "id": "uuid-inventory-id",
        "branchId": "uuid-branch-id",
        "productId": "uuid-product-id",
        "quantity": 150.50,
        "reservedQuantity": 25.00,
        "availableQuantity": 125.50,
        "averageCost": 89.99,
        "totalValue": 13548.45,
        "availableValue": 11299.45,
        "isLowStock": false,
        "needsRestock": false,
        "stockStatus": "in_stock",
        "lastUpdated": "2024-07-26T15:30:00Z",
        "product": {
          "id": "uuid-product-id",
          "name": "Laptop Dell Inspiron 15",
          "sku": "DELL-INSP-001",
          "price": 1299.99,
          "minStockLevel": 10,
          "reorderPoint": 20
        },
        "branch": {
          "id": "uuid-branch-id",
          "name": "Tienda Centro",
          "code": "TC001"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  },
  "statusCode": 200,
  "timestamp": "2024-07-26T16:00:00.123Z"
}
```

---

## 📋 **2. Ver Inventario de un Producto en Todas las Sucursales**

```http
GET {{API_BASE_URL}}/products/{{PRODUCT_ID}}/inventory
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Product inventory retrieved successfully",
  "data": [
    {
      "id": "uuid-inventory-1",
      "branchId": "uuid-branch-1",
      "productId": "uuid-product-id",
      "quantity": 150.50,
      "reservedQuantity": 25.00,
      "availableQuantity": 125.50,
      "stockStatus": "in_stock",
      "branch": {
        "id": "uuid-branch-1",
        "name": "Tienda Centro",
        "code": "TC001"
      }
    },
    {
      "id": "uuid-inventory-2",
      "branchId": "uuid-branch-2",
      "productId": "uuid-product-id",
      "quantity": 8.00,
      "reservedQuantity": 0.00,
      "availableQuantity": 8.00,
      "stockStatus": "low_stock",
      "branch": {
        "id": "uuid-branch-2",
        "name": "Sucursal Norte",
        "code": "SN001"
      }
    }
  ],
  "statusCode": 200
}
```

---

## ⚖️ **3. Ajustar Stock de un Producto**

```http
POST {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory/adjust
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "productId": "{{PRODUCT_ID}}",
  "newQuantity": 175.50,
  "reason": "Recuento físico mensual - diferencia encontrada",
  "costPerUnit": 89.99
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Stock adjusted successfully",
  "data": {
    "inventory": {
      "id": "uuid-inventory-id",
      "quantity": 175.50,
      "previousQuantity": 150.50,
      "totalValue": 15797.45,
      "stockStatus": "in_stock",
      "lastUpdated": "2024-07-26T16:05:00Z"
    },
    "movement": {
      "id": "uuid-movement-id",
      "quantity": 25.00,
      "type": "adjustment",
      "typeDisplayName": "Adjustment",
      "isInbound": true,
      "notes": "Stock adjustment: Recuento físico mensual",
      "costPerUnit": 89.99,
      "totalCost": 2249.75,
      "createdAt": "2024-07-26T16:05:00Z"
    }
  },
  "statusCode": 200
}
```

---

## 📊 **4. Ajuste Masivo de Stock**

```http
POST {{API_BASE_URL}}/inventory/bulk-adjust
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "branchId": "{{BRANCH_ID}}",
  "notes": "Inventario físico mensual - Octubre 2024",
  "adjustments": [
    {
      "productId": "uuid-product-1",
      "newQuantity": 125.50,
      "reason": "Diferencia en conteo físico",
      "costPerUnit": 89.99
    },
    {
      "productId": "uuid-product-2",
      "newQuantity": 89.00,
      "reason": "Producto encontrado en depósito",
      "costPerUnit": 45.50
    },
    {
      "productId": "uuid-product-3",
      "newQuantity": 0.00,
      "reason": "Producto dañado - pérdida total"
    }
  ]
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Bulk stock adjustment completed",
  "data": {
    "results": [
      {
        "inventory": { "quantity": 125.50, "productId": "uuid-product-1" },
        "movement": { "quantity": 10.50, "type": "adjustment" }
      },
      {
        "inventory": { "quantity": 89.00, "productId": "uuid-product-2" },
        "movement": { "quantity": 15.00, "type": "adjustment" }
      },
      {
        "inventory": { "quantity": 0.00, "productId": "uuid-product-3" },
        "movement": { "quantity": -25.00, "type": "adjustment" }
      }
    ],
    "errors": []
  },
  "statusCode": 200
}
```

---

## 🔒 **5. Reservar Stock**

```http
POST {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory/{{PRODUCT_ID}}/reserve?quantity=5&referenceId=uuid-order-123
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Stock reserved successfully",
  "data": {
    "id": "uuid-inventory-id",
    "quantity": 175.50,
    "reservedQuantity": 30.00,
    "availableQuantity": 145.50,
    "stockStatus": "in_stock",
    "lastUpdated": "2024-07-26T16:10:00Z"
  },
  "statusCode": 200
}
```

---

## 🔓 **6. Liberar Stock Reservado**

```http
POST {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory/{{PRODUCT_ID}}/release?quantity=5
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📊 **7. Estadísticas de Inventario**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/inventory/stats
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Inventory statistics retrieved successfully",
  "data": {
    "totalProducts": 1250,
    "totalQuantity": 15750.50,
    "totalValue": 1245780.95,
    "inStockProducts": 850,
    "lowStockProducts": 125,
    "outOfStockProducts": 75,
    "needsRestockProducts": 200,
    "byBranch": {
      "Tienda Centro": {
        "products": 500,
        "quantity": 8500.5,
        "value": 678950.25
      },
      "Sucursal Norte": {
        "products": 350,
        "quantity": 4250.0,
        "value": 345890.50
      },
      "Sucursal Sur": {
        "products": 400,
        "quantity": 3000.0,
        "value": 220940.20
      }
    },
    "topProductsByValue": [
      {
        "productId": "uuid-product-1",
        "name": "Laptop Dell Inspiron 15",
        "quantity": 150.50,
        "value": 195547.45
      },
      {
        "productId": "uuid-product-2",
        "name": "Monitor 24 pulgadas",
        "quantity": 75.00,
        "value": 89985.00
      }
    ],
    "recentMovements": {
      "todayMovements": 45,
      "weekMovements": 187,
      "monthMovements": 892
    }
  },
  "statusCode": 200
}
```

---

## ⚠️ **8. Productos con Stock Bajo**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/inventory/low-stock
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Low stock products retrieved successfully",
  "data": [
    {
      "id": "uuid-inventory-1",
      "branchId": "uuid-branch-1",
      "productId": "uuid-product-1",
      "quantity": 8.00,
      "availableQuantity": 8.00,
      "isLowStock": true,
      "stockStatus": "low_stock",
      "product": {
        "name": "Teclado Mecánico",
        "sku": "TEKLA-001",
        "minStockLevel": 10
      },
      "branch": {
        "name": "Sucursal Norte",
        "code": "SN001"
      }
    }
  ],
  "statusCode": 200
}
```

---

## 🔄 **9. Productos que Necesitan Restock**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/inventory/restock-needed
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 🔍 **10. Filtros Avanzados de Inventario**

### **Solo productos sin stock:**
```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory?outOfStock=true
```

### **Solo productos con stock bajo:**
```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory?lowStock=true
```

### **Solo productos que necesitan restock:**
```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory?needsRestock=true
```

### **Por estado específico:**
```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory?stockStatus=low_stock
```

### **Búsqueda por producto:**
```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory?search=laptop&sortBy=quantity&sortOrder=ASC
```

---

## 🚨 **Casos de Error Comunes**

### **400 - Stock Insuficiente para Reservar**
```json
{
  "success": false,
  "message": "Cannot reserve 50 units. Only 25.5 available.",
  "statusCode": 400,
  "timestamp": "2024-07-26T16:20:00.123Z"
}
```

### **400 - No se puede Retirar más Stock del Disponible**
```json
{
  "success": false,
  "message": "Cannot remove 100 units. Only 75.5 available.",
  "statusCode": 400,
  "timestamp": "2024-07-26T16:20:00.123Z"
}
```

### **403 - Sin Permisos para Ajustar Stock**
```json
{
  "success": false,
  "message": "Required role: owner or admin or manager",
  "statusCode": 403,
  "timestamp": "2024-07-26T16:20:00.123Z"
}
```

### **404 - Sucursal o Producto no Encontrado**
```json
{
  "success": false,
  "message": "Branch not found",
  "statusCode": 404,
  "timestamp": "2024-07-26T16:20:00.123Z"
}
```

---

## 🧪 **Script de Testing Completo**

```bash
#!/bin/bash
# test-inventory-flow.sh

API_BASE="http://localhost:3000/api"
COMPANY_ID="tu-company-id"
BRANCH_ID="tu-branch-id"
PRODUCT_ID="tu-product-id"
TOKEN="tu-access-token"

echo "📊 Testing Inventory API Flow..."

# 1. Ver inventario de sucursal
echo "1. Getting branch inventory..."
curl -s -X GET "$API_BASE/branches/$BRANCH_ID/inventory?limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.total'

# 2. Ajustar stock
echo "2. Adjusting stock..."
curl -s -X POST "$API_BASE/branches/$BRANCH_ID/inventory/adjust" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "'$PRODUCT_ID'",
    "newQuantity": 100,
    "reason": "Test adjustment",
    "costPerUnit": 50.00
  }' | jq '.success'

# 3. Reservar stock
echo "3. Reserving stock..."
curl -s -X POST "$API_BASE/branches/$BRANCH_ID/inventory/$PRODUCT_ID/reserve?quantity=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.reservedQuantity'

# 4. Ver estadísticas
echo "4. Getting inventory stats..."
curl -s -X GET "$API_BASE/companies/$COMPANY_ID/inventory/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.totalProducts'

# 5. Ver productos con stock bajo
echo "5. Getting low stock products..."
curl -s -X GET "$API_BASE/companies/$COMPANY_ID/inventory/low-stock" \
  -H "Authorization: Bearer $TOKEN" | jq 'length'

# 6. Liberar reserva
echo "6. Releasing reservation..."
curl -s -X POST "$API_BASE/branches/$BRANCH_ID/inventory/$PRODUCT_ID/release?quantity=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.success'

echo "🎉 Inventory test completed!"
```

---

## 📝 **Conceptos Importantes**

### 🏪 **Inventario por Sucursal:**
- Cada producto puede tener **diferentes cantidades** en **diferentes sucursales**
- El inventario es **independiente** entre sucursales
- Una sucursal puede tener stock de un producto y otra no

### 📊 **Estados de Stock:**
- **`in_stock`**: Stock normal, por encima del mínimo
- **`low_stock`**: Stock por debajo del nivel mínimo
- **`needs_restock`**: Stock por debajo del punto de reorden
- **`out_of_stock`**: Sin stock (cantidad = 0)

### 🔒 **Stock Reservado:**
- **Quantity**: Total en stock
- **Reserved Quantity**: Cantidad reservada (para órdenes pendientes)
- **Available Quantity**: Quantity - Reserved Quantity

### 💰 **Costeo Promedio Ponderado:**
- El sistema mantiene el **costo promedio** por producto
- Se actualiza automáticamente con cada entrada de stock
- Permite **valorización** precisa del inventario

¡Prueba todos estos endpoints para verificar que el módulo Inventory funciona correctamente! 📊🚀
