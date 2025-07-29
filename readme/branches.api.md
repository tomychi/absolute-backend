# 🏪 Branches API - Ejemplos de Uso

## 📋 **Variables de Entorno**

```bash
# .env variables
API_BASE_URL=http://localhost:3000/api
COMPANY_ID=uuid-de-tu-empresa
BRANCH_ID=uuid-de-sucursal
ACCESS_TOKEN=tu-jwt-token
```

## 🔐 **Headers Comunes**

```http
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json
```

---

## 📝 **1. Crear Nueva Sucursal**

```http
POST {{API_BASE_URL}}/companies/{{COMPANY_ID}}/branches
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "name": "Tienda Centro",
  "code": "TC001",
  "type": "retail",
  "address": "Av. Independencia 1234, Río Cuarto, Córdoba",
  "phone": "+54-358-123-4567",
  "email": "centro@miempresa.com",
  "latitude": -33.1301,
  "longitude": -64.3499,
  "businessHours": {
    "monday": { "open": "09:00", "close": "18:00", "closed": false },
    "tuesday": { "open": "09:00", "close": "18:00", "closed": false },
    "wednesday": { "open": "09:00", "close": "18:00", "closed": false },
    "thursday": { "open": "09:00", "close": "18:00", "closed": false },
    "friday": { "open": "09:00", "close": "20:00", "closed": false },
    "saturday": { "open": "09:00", "close": "13:00", "closed": false },
    "sunday": { "open": "00:00", "close": "00:00", "closed": true }
  },
  "isActive": true,
  "isMain": true
}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Branch created successfully",
  "data": {
    "id": "uuid-branch-id",
    "name": "Tienda Centro",
    "code": "TC001",
    "type": "retail",
    "typeDisplayName": "Retail Store",
    "address": "Av. Independencia 1234, Río Cuarto, Córdoba",
    "phone": "+54-358-123-4567",
    "email": "centro@miempresa.com",
    "isActive": true,
    "isMain": true,
    "latitude": -33.1301,
    "longitude": -64.3499,
    "businessHours": { ... },
    "createdAt": "2024-07-26T10:30:00Z",
    "updatedAt": "2024-07-26T10:30:00Z",
    "displayName": "Tienda Centro (TC001)",
    "isCurrentlyOpen": true
  },
  "statusCode": 201,
  "timestamp": "2024-07-26T10:30:00.123Z"
}
```

---

## 📋 **2. Listar Sucursales con Filtros**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/branches?page=1&limit=10&search=Centro&type=retail&isActive=true&sortBy=name&sortOrder=ASC
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Branches retrieved successfully",
  "data": {
    "branches": [
      {
        "id": "uuid-branch-id",
        "name": "Tienda Centro",
        "code": "TC001",
        "type": "retail",
        "isActive": true,
        "isMain": true,
        "displayName": "Tienda Centro (TC001)",
        "isCurrentlyOpen": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  },
  "statusCode": 200,
  "timestamp": "2024-07-26T10:35:00.123Z"
}
```

---

## 🏪 **3. Obtener Sucursal por ID**

```http
GET {{API_BASE_URL}}/branches/{{BRANCH_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## ✏️ **4. Actualizar Sucursal**

```http
PATCH {{API_BASE_URL}}/branches/{{BRANCH_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "name": "Tienda Centro Renovada",
  "address": "Av. Independencia 1234 - Local 1, Río Cuarto",
  "phone": "+54-358-999-8888",
  "email": "centro.renovada@miempresa.com",
  "businessHours": {
    "monday": { "open": "08:00", "close": "19:00", "closed": false },
    "tuesday": { "open": "08:00", "close": "19:00", "closed": false },
    "wednesday": { "open": "08:00", "close": "19:00", "closed": false },
    "thursday": { "open": "08:00", "close": "19:00", "closed": false },
    "friday": { "open": "08:00", "close": "20:00", "closed": false },
    "saturday": { "open": "08:00", "close": "14:00", "closed": false },
    "sunday": { "open": "10:00", "close": "13:00", "closed": false }
  }
}
```

---

## 🔄 **5. Activar/Desactivar Sucursal**

```http
PATCH {{API_BASE_URL}}/branches/{{BRANCH_ID}}/toggle-status
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 👨‍💼 **6. Asignar Manager a Sucursal**

```http
PATCH {{API_BASE_URL}}/branches/{{BRANCH_ID}}/assign-manager
Authorization: Bearer {{ACCESS_TOKEN}}
Content-Type: application/json

{
  "managerId": "uuid-del-manager"
}
```

**Para remover manager:**
```json
{
  "managerId": null
}
```

---

## 🏢 **7. Obtener Sucursal Principal**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/branches/main
Authorization: Bearer {{ACCESS_TOKEN}}
```

---

## 📊 **8. Estadísticas de Sucursales**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/branches/stats
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Branch statistics retrieved successfully",
  "data": {
    "totalBranches": 5,
    "activeBranches": 4,
    "inactiveBranches": 1,
    "byType": {
      "retail": 3,
      "warehouse": 1,
      "office": 1,
      "virtual": 0,
      "distribution": 0
    },
    "branchesWithManager": 3,
    "branchesWithoutManager": 2
  },
  "statusCode": 200,
  "timestamp": "2024-07-26T10:40:00.123Z"
}
```

---

## 📋 **9. Resúmenes de Sucursales (para Dropdowns)**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/branches/summaries?activeOnly=true
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Branch summaries retrieved successfully",
  "data": [
    {
      "id": "uuid-main-branch",
      "name": "Oficina Principal",
      "code": "OP001",
      "type": "office",
      "isActive": true,
      "isMain": true,
      "managerName": "Juan Manager",
      "address": "Centro Empresarial, Piso 5",
      "isCurrentlyOpen": true
    },
    {
      "id": "uuid-retail-branch",
      "name": "Tienda Centro",
      "code": "TC001",
      "type": "retail",
      "isActive": true,
      "isMain": false,
      "managerName": "María Vendedora",
      "address": "Av. Independencia 1234",
      "isCurrentlyOpen": true
    }
  ],
  "statusCode": 200,
  "timestamp": "2024-07-26T10:45:00.123Z"
}
```

---

## 🔄 **10. Transferir Estatus de Sucursal Principal**

```http
POST {{API_BASE_URL}}/branches/{{FROM_BRANCH_ID}}/transfer-main/{{TO_BRANCH_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Main branch status transferred successfully",
  "data": {
    "from": {
      "id": "uuid-from-branch",
      "name": "Antigua Principal",
      "isMain": false
    },
    "to": {
      "id": "uuid-to-branch",
      "name": "Nueva Principal",
      "isMain": true
    }
  },
  "statusCode": 200,
  "timestamp": "2024-07-26T10:50:00.123Z"
}
```

---

## 🏷️ **11. Generar Código de Sucursal**

```http
GET {{API_BASE_URL}}/companies/{{COMPANY_ID}}/branches/generate-code?branchName=Nueva Sucursal Sur
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```json
{
  "success": true,
  "message": "Branch code suggestion generated successfully",
  "data": {
    "suggestedCode": "MINUE01"
  },
  "statusCode": 200,
  "timestamp": "2024-07-26T10:55:00.123Z"
}
```

---

## 🗑️ **12. Eliminar Sucursal (Soft Delete)**

```http
DELETE {{API_BASE_URL}}/branches/{{BRANCH_ID}}
Authorization: Bearer {{ACCESS_TOKEN}}
```

**Respuesta Esperada:**
```http
HTTP/1.1 204 No Content
```

---

## 🚨 **Casos de Error Comunes**

### **409 - Código Duplicado**
```json
{
  "success": false,
  "message": "Branch code 'TC001' already exists in this company",
  "statusCode": 409,
  "timestamp": "2024-07-26T11:00:00.123Z"
}
```

### **403 - Sin Permisos**
```json
{
  "success": false,
  "message": "Required role: owner or admin",
  "statusCode": 403,
  "timestamp": "2024-07-26T11:00:00.123Z"
}
```

### **400 - No se puede desactivar sucursal principal**
```json
{
  "success": false,
  "message": "Cannot deactivate the main branch when it is the only active branch",
  "statusCode": 400,
  "timestamp": "2024-07-26T11:00:00.123Z"
}
```

### **404 - Sucursal no encontrada**
```json
{
  "success": false,
  "message": "Branch not found",
  "statusCode": 404,
  "timestamp": "2024-07-26T11:00:00.123Z"
}
```

---

## 🧪 **Scripts de Testing**

### **Test de Flujo Completo**

```bash
#!/bin/bash
# test-branches-flow.sh

# Variables
API_BASE="http://localhost:3000/api"
COMPANY_ID="tu-company-id"
TOKEN="tu-access-token"

echo "🏪 Testing Branches API Flow..."

# 1. Crear sucursal
echo "1. Creating branch..."
BRANCH_RESPONSE=$(curl -s -X POST "$API_BASE/companies/$COMPANY_ID/branches" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Branch",
    "code": "TB001",
    "type": "retail",
    "address": "Test Address",
    "isActive": true
  }')

BRANCH_ID=$(echo $BRANCH_RESPONSE | jq -r '.data.id')
echo "✅ Branch created: $BRANCH_ID"

# 2. Obtener sucursal
echo "2. Getting branch..."
curl -s -X GET "$API_BASE/branches/$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.name'

# 3. Actualizar sucursal
echo "3. Updating branch..."
curl -s -X PATCH "$API_BASE/branches/$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Updated Test Branch"}' | jq '.success'

# 4. Obtener estadísticas
echo "4. Getting stats..."
curl -s -X GET "$API_BASE/companies/$COMPANY_ID/branches/stats" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.totalBranches'

# 5. Eliminar sucursal
echo "5. Deleting branch..."
curl -s -X DELETE "$API_BASE/branches/$BRANCH_ID" \
  -H "Authorization: Bearer $TOKEN"

echo "🎉 Test completed!"
```

---

## 📱 **Colección de Postman**

```json
{
  "info": {
    "name": "Branches API",
    "description": "Complete branches management endpoints",
    "version": "1.0.0"
  },
  "variable": [
    {
