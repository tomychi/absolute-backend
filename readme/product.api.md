# 📦 Products API - Ejemplos de Testing

## 🔐 **Variables de Entorno**

```bash
# .env variables
API_BASE_URL=http://localhost:3000/api
COMPANY_ID=uuid-de-tu-empresa
PRODUCT_ID=uuid-de-producto
ACCESS_TOKEN=tu-jwt-token
```

## 📝 **1. Crear Nuevo Producto**

```http
POST {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "name": "Laptop Dell Inspiron 15",
  "sku": "DELL-INSP-001",
  "description": "Laptop de alto rendimiento con 16GB RAM y 512GB SSD",
  "price": 1299.99,
  "cost": 999.50,
  "type": "physical",
  "status": "active",
  "unit": "unit",
  "isActive": true,
  "trackInventory": true,
  "allowBackorder": false,
  "minStockLevel": 5,
  "maxStockLevel": 50,
  "reorderPoint": 10,
  "reorderQuantity": 25,
  "dimensions": {
    "length": 35.0,
    "width": 25.0,
    "height": 2.0,
    "weight": 2.5,
    "unit": "cm"
  },
  "metadata": {
    "brand": "Dell",
    "model": "Inspiron 15 3000",
    "color": "Negro",
    "warranty": "1 año",
    "tags": ["laptop", "computadora", "electrónica"]
  },
  "imageUrl": "https://example.com/images/dell-inspiron.jpg",
  "barcode": "1234567890123"
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "uuid-product-id",
    "name": "Laptop Dell Inspiron 15",
    "sku": "DELL-INSP-001",
    "description": "Laptop de alto rendimiento...",
    "price": 1299.99,
    "cost": 999.50,
    "type": "physical",
    "typeDisplayName": "Physical Product",
    "status": "active",
    "statusDisplayName": "Active",
    "unit": "unit",
    "unitDisplayName": "Unit",
    "isActive": true,
    "trackInventory": true,
    "allowBackorder": false,
    "minStockLevel": 5,
    "maxStockLevel": 50,
    "reorderPoint": 10,
    "reorderQuantity": 25,
    "dimensions": { ... },
    "metadata": { ... },
    "imageUrl": "https://example.com/images/dell-inspiron.jpg",
    "barcode": "1234567890123",
    "createdAt": "2024-07-26T15:30:00Z",
    "updatedAt": "2024-07-26T15:30:00Z",
    "displayName": "Laptop Dell Inspiron 15 (DELL-INSP-001)",
    "profitMargin": 30.05,
    "profitAmount": 300.49
  },
  "statusCode": 201,
  "timestamp": "2024-07-26T15:30:00.123Z"
}
```

---

## 📋 **2. Listar Productos con Filtros**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products?page=1&limit=10&search=laptop&type=physical&status=active&isActive=true&minPrice=500&maxPrice=2000&sortBy=name&sortOrder=ASC
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "products": [
      {
        "id": "uuid-product-id",
        "name": "Laptop Dell Inspiron 15",
        "sku": "DELL-INSP-001",
        "price": 1299.99,
        "cost": 999.50,
        "type": "physical",
        "status": "active",
        "isActive": true,
        "displayName": "Laptop Dell Inspiron 15 (DELL-INSP-001)",
        "profitMargin": 30.05
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "statusCode": 200,
  "timestamp": "2024-07-26T15:35:00.123Z"
}
```

---

## 📊 **3. Estadísticas de Productos**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products/stats
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Product statistics retrieved successfully",
  "data": {
    "totalProducts": 125,
    "activeProducts": 110,
    "inactiveProducts": 15,
    "byType": {
      "physical": 95,
      "digital": 20,
      "service": 10,
      "subscription": 0
    },
    "byStatus": {
      "active": 110,
      "inactive": 10,
      "discontinued": 3,
      "out_of_stock": 2
    },
    "trackedProducts": 95,
    "untrackedProducts": 30,
    "lowStockProducts": 8,
    "needsRestockProducts": 5,
    "totalInventoryValue": 156750.50,
    "averagePrice": 345.60,
    "averageCost": 234.80,
    "averageProfitMargin": 47.15
  },
  "statusCode": 200
}
```

---

## 🏷️ **4. Generar SKU Sugerido**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products/generate-sku?productName=Mouse Inalámbrico Logitech
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "SKU suggestion generated successfully",
  "data": {
    "suggestedSku": "MIMOU001"
  },
  "statusCode": 200
}
```

---

## 📱 **5. Buscar por Código de Barras**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products/barcode/1234567890123
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📤 **6. Carga Masiva de Productos**

```http
POST {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products/bulk-upload
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "skipErrors": true,
  "updateExisting": false,
  "products": [
    {
      "rowNumber": 1,
      "name": "Teclado Mecánico",
      "sku": "TEKLA-001",
      "price": 85.99,
      "cost": 55.00,
      "type": "physical",
      "status": "active",
      "unit": "unit",
      "trackInventory": true,
      "minStockLevel": 10
    },
    {
      "rowNumber": 2,
      "name": "Monitor 24 pulgadas",
      "sku": "MON24-001",
      "price": 299.99,
      "cost": 199.99,
      "type": "physical",
      "status": "active",
      "unit": "unit",
      "trackInventory": true,
      "minStockLevel": 5
    },
    {
      "rowNumber": 3,
      "name": "Software Antivirus",
      "sku": "SOFT-AV-001",
      "price": 49.99,
      "type": "digital",
      "status": "active",
      "unit": "unit",
      "trackInventory": false
    }
  ]
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Bulk upload completed successfully",
  "data": {
    "totalProcessed": 3,
    "successCount": 3,
    "updatedCount": 0,
    "errorCount": 0,
    "errors": [],
    "createdIds": ["uuid-1", "uuid-2", "uuid-3"],
    "updatedIds": []
  },
  "statusCode": 200
}
```

---

## 📋 **7. Resúmenes para Dropdowns**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products/summaries?activeOnly=true&limit=50
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Product summaries retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "name": "Laptop Dell Inspiron 15",
      "sku": "DELL-INSP-001",
      "price": 1299.99,
      "cost": 999.50,
      "type": "physical",
      "status": "active",
      "unit": "unit",
      "isActive": true,
      "trackInventory": true,
      "displayName": "Laptop Dell Inspiron 15 (DELL-INSP-001)",
      "imageUrl": "https://example.com/images/dell-inspiron.jpg"
    },
    {
      "id": "uuid-2",
      "name": "Teclado Mecánico",
      "sku": "TEKLA-001",
      "price": 85.99,
      "cost": 55.00,
      "type": "physical",
      "status": "active",
      "unit": "unit",
      "isActive": true,
      "trackInventory": true,
      "displayName": "Teclado Mecánico (TEKLA-001)"
    }
  ],
  "statusCode": 200
}
```

---

## ✏️ **8. Actualizar Producto**

```http
PATCH {{API_BASE_URL}}/products/{{PRODUCT_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "name": "Laptop Dell Inspiron 15 - Modelo 2024",
  "description": "Laptop actualizada con mejores especificaciones",
  "price": 1399.99,
  "cost": 1099.50,
  "maxStockLevel": 75,
  "reorderQuantity": 30,
  "metadata": {
    "brand": "Dell",
    "model": "Inspiron 15 3000 - 2024",
    "color": "Negro",
    "warranty": "2 años",
    "tags": ["laptop", "computadora", "electrónica", "2024"]
  }
}
```

---

## 🔄 **9. Cambiar Estado del Producto**

```http
PATCH {{API_BASE_URL}}/products/{{PRODUCT_ID}}/toggle-status
Authorization: Bearer {{ACCESS_TOKEN}}
```

```http
PATCH {{API_BASE_URL}}/products/{{PRODUCT_ID}}/status/discontinued
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 🗑️ **10. Eliminar Producto**

```http
DELETE {{API_BASE_URL}}/products/{{PRODUCT_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📊 **11. Búsqueda Avanzada**

### **Por Rango de Precios:**
```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products?minPrice=100&maxPrice=500&sortBy=price&sortOrder=ASC
```

### **Solo Productos Físicos:**
```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products?type=physical&trackInventory=true
```

### **Productos Digitales y Servicios:**
```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/products?type=digital,service&isActive=true
```

---

## 🚨 **Casos de Error Comunes**

### **409 - SKU Duplicado**
```json
{
  "success": false,
  "message": "Product with SKU 'DELL-INSP-001' already exists in this company",
  "statusCode": 409,
  "timestamp": "2024-07-26T16:00:00.123Z"
}
```

### **400 - Validación de Negocio**
```json
{
  "success": false,
  "message": "Cost cannot be greater than selling price",
  "statusCode": 400,
  "timestamp": "2024-07-26T16:00:00.123Z"
}
```

### **400 - Validación de Campos**
```json
{
  "success": false,
  "message": [
    "Product name must be at least 2 characters long",
    "Price must be greater than or equal to 0",
    "SKU must contain only uppercase letters, numbers, hyphens, and underscores"
  ],
  "statusCode": 400,
  "timestamp": "2024-07-26T16:00:00.123Z"
}
```

---

## 🧪 **Script de Testing Completo**

```bash
#!/bin/bash
# test-products-flow.sh

API_BASE="http://localhost:3000/api"
COMPANY_ID="tu-company-id"
TOKEN="tu-access-token"

echo "📦 Testing Products API Flow..."

# 1. Crear producto
echo "1. Creating product..."
PRODUCT_RESPONSE=$(curl -s -X POST "$API_BASE/companies/$COMPANY_ID/products" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product API",
    "sku": "TEST-API-001",
    "price": 99.99,
    "cost": 59.99,
    "type": "physical",
    "status": "active",
    "unit": "unit"
  }')

PRODUCT_ID=$(echo $PRODUCT_RESPONSE | jq -r '.data.id')
echo "✅ Product created: $PRODUCT_ID"

# 2. Obtener producto
echo "2. Getting product..."
curl -s -X GET "$API_BASE/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.displayName'

# 3. Estadísticas
echo "3. Getting stats..."
curl -s -X GET "$API_BASE/companies/$COMPANY_ID/products/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.totalProducts'

# 4. Generar SKU
echo "4. Generating SKU..."
curl -s -X GET "$API_BASE/companies/$COMPANY_ID/products/generate-sku?productName=Nuevo Producto" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.suggestedSku'

# 5. Actualizar producto
echo "5. Updating product..."
curl -s -X PATCH "$API_BASE/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"price": 119.99}' | jq '.success'

# 6. Eliminar producto
echo "6. Deleting product..."
curl -s -X DELETE "$API_BASE/products/$PRODUCT_ID" \
  -H "Authorization: Bearer $TOKEN"

echo "🎉 Products test completed!"
```

---

## 📝 **Notas de Testing**

✅ **Productos Físicos**: Requieren `trackInventory: true`
✅ **Productos Digitales**: No pueden tener tracking de inventario
✅ **SKUs**: Deben ser únicos por empresa
✅ **Precios**: Costo no puede ser mayor que precio de venta
✅ **Stock Levels**: Min stock ≤ Max stock
✅ **Reorder Point**: Debe ser ≥ Min stock level

¡Prueba todos estos endpoints para verificar que el módulo Products funciona correctamente! 🚀
