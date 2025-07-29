# 📦 Cómo Agregar Stock Inicial - Ejemplos Prácticos

## 🎯 **El Problema que Tenías:**
Tu inventario estaba **vacío** porque no habías agregado stock inicial a tus productos.

## ✅ **Solución: Usar los Nuevos Endpoints**

### 🔧 **Variables de Entorno**
```bash
API_BASE_URL=http://localhost:3000/api
COMPANY_ID=tu-company-id
BRANCH_ID=tu-branch-id
PRODUCT_ID=tu-product-id
ACCESS_TOKEN=tu-jwt-token
```

---

## 📦 **1. Agregar Stock Inicial (Método Recomendado)**

```http
POST {{API_BASE_URL}}/stock-movements/initial-stock
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "branchId": "{{BRANCH_ID}}",
  "productId": "{{PRODUCT_ID}}",
  "quantity": 100,
  "costPerUnit": 89.99,
  "notes": "Stock inicial para apertura de tienda"
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Initial stock set successfully",
  "data": {
    "movement": {
      "id": "uuid-movement-id",
      "quantity": 100,
      "type": "initial",
      "typeDisplayName": "Initial Stock",
      "isInbound": true,
      "costPerUnit": 89.99,
      "totalCost": 8999.00,
      "notes": "Stock inicial para apertura de tienda"
    },
    "inventory": {
      "id": "uuid-inventory-id",
      "quantity": 100,
      "reservedQuantity": 0,
      "availableQuantity": 100,
      "averageCost": 89.99,
      "totalValue": 8999.00,
      "stockStatus": "in_stock"
    }
  }
}
```

---

## 🛒 **2. Simular una Compra (Agregar más stock)**

```http
POST {{API_BASE_URL}}/stock-movements/purchase
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "branchId": "{{BRANCH_ID}}",
  "productId": "{{PRODUCT_ID}}",
  "quantity": 50,
  "costPerUnit": 85.00,
  "notes": "Compra a proveedor ABC",
  "referenceId": "PURCHASE-001"
}
```

**Resultado:** Tu stock ahora será **150 unidades** con costo promedio ponderado.

---

## 💰 **3. Simular una Venta (Retirar stock)**

```http
POST {{API_BASE_URL}}/stock-movements/sale
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "branchId": "{{BRANCH_ID}}",
  "productId": "{{PRODUCT_ID}}",
  "quantity": 25,
  "notes": "Venta a cliente",
  "referenceId": "INVOICE-001"
}
```

**Resultado:** Tu stock ahora será **125 unidades**.

---

## ⚖️ **4. Crear Movimiento Personalizado**

```http
POST {{API_BASE_URL}}/stock-movements
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "branchId": "{{BRANCH_ID}}",
  "productId": "{{PRODUCT_ID}}",
  "quantity": 10,
  "type": "found",
  "notes": "Productos encontrados en depósito",
  "costPerUnit": 89.99
}
```

---

## 📊 **5. Ver el Inventario Actualizado**

```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/inventory
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Ahora verás:**
```json
{
  "success": true,
  "message": "Inventory retrieved successfully",
  "data": {
    "inventory": [
      {
        "id": "uuid-inventory-id",
        "productId": "{{PRODUCT_ID}}",
        "quantity": 135,
        "reservedQuantity": 0,
        "availableQuantity": 135,
        "averageCost": 87.50,
        "totalValue": 11812.50,
        "stockStatus": "in_stock",
        "product": {
          "name": "Laptop Dell Inspiron 15",
          "sku": "DELL-INSP-001"
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

---

## 📈 **6. Ver Historial de Movimientos**

```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}/stock-movements
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Verás todos los movimientos:**
```json
{
  "success": true,
  "message": "Stock movements retrieved successfully",
  "data": {
    "movements": [
      {
        "id": "uuid-1",
        "quantity": 10,
        "type": "found",
        "typeDisplayName": "Found",
        "movementDescription": "Added 10 units - Found",
        "createdAt": "2024-07-26T21:45:00Z"
      },
      {
        "id": "uuid-2",
        "quantity": -25,
        "type": "sale",
        "typeDisplayName": "Sale",
        "movementDescription": "Removed 25 units - Sale",
        "createdAt": "2024-07-26T21:40:00Z"
      },
      {
        "id": "uuid-3",
        "quantity": 50,
        "type": "purchase",
        "typeDisplayName": "Purchase",
        "movementDescription": "Added 50 units - Purchase",
        "createdAt": "2024-07-26T21:35:00Z"
      },
      {
        "id": "uuid-4",
        "quantity": 100,
        "type": "initial",
        "typeDisplayName": "Initial Stock",
        "movementDescription": "Added 100 units - Initial Stock",
        "createdAt": "2024-07-26T21:30:00Z"
      }
    ],
    "total": 4
  }
}
```

---

## 🚀 **Script para Setup Rápido**

```bash
#!/bin/bash
# setup-initial-inventory.sh

API_BASE="http://localhost:3000/api"
COMPANY_ID="tu-company-id"
BRANCH_ID="tu-branch-id"
PRODUCT_ID="tu-product-id"
TOKEN="tu-access-token"

echo "📦 Setting up initial inventory..."

# 1. Agregar stock inicial
echo "1. Adding initial stock..."
curl -s -X POST "$API_BASE/stock-movements/initial-stock" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "branchId": "'$BRANCH_ID'",
    "productId": "'$PRODUCT_ID'",
    "quantity": 100,
    "costPerUnit": 89.99,
    "notes": "Initial stock setup"
  }' | jq '.success'

# 2. Verificar inventario
echo "2. Checking inventory..."
curl -s -X GET "$API_BASE/branches/$BRANCH_ID/inventory" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.total'

echo "✅ Initial inventory setup completed!"
```

---

## 🎯 **Tipos de Movimientos Disponibles:**

- **`initial`** - Stock inicial (setup)
- **`purchase`** - Compras (entrada)
- **`sale`** - Ventas (salida)
- **`adjustment`** - Ajustes manuales
- **`transfer_in`** - Transferencia entrante
- **`transfer_out`** - Transferencia saliente
- **`return`** - Devoluciones
- **`loss`** - Pérdidas/daños
- **`found`** - Productos encontrados

---

## ✅ **¿Qué Hacer Ahora?**

1. **Crear los archivos faltantes:**
   ```bash
   touch src/modules/inventory/services/stock-movements.service.ts
   touch src/modules/inventory/controllers/stock-movements.controller.ts
   ```

2. **Copiar el contenido de los artifacts**

3. **Reiniciar el servidor:**
   ```bash
   npm run start:dev
   ```

4. **Agregar stock inicial** usando los endpoints de arriba

5. **Verificar que ya tienes inventario:**
   ```bash
   GET /branches/tu-branch-id/inventory
   ```

¡Después de esto tu inventario ya no estará vacío! 🎉
