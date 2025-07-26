# 🏢 Guía Completa para Probar el Módulo de Companies

## 1. Preparación inicial

### ⚠️ **IMPORTANTE:** Necesitas estar autenticado
Primero haz login en `/auth/login` y guarda el `accessToken` para usar en todos estos endpoints.

## 2. Probar con Postman/Thunder Client

### 🏢 **PASO 1: Crear una nueva empresa**

**POST** `http://localhost:3000/companies`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Tech Solutions Inc.",
  "taxId": "12-3456789-0",
  "address": "123 Innovation Ave, Tech City, TC 12345",
  "phone": "+1-555-123-4567",
  "email": "contact@techsolutions.com",
  "website": "https://www.techsolutions.com",
  "description": "Leading provider of innovative technology solutions for modern businesses",
  "isActive": true
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": "uuid-nueva-empresa",
    "name": "Tech Solutions Inc.",
    "taxId": "12-3456789-0",
    "address": "123 Innovation Ave, Tech City, TC 12345",
    "phone": "+1-555-123-4567",
    "email": "contact@techsolutions.com",
    "website": "https://www.techsolutions.com",
    "description": "Leading provider of innovative technology solutions for modern businesses",
    "isActive": true,
    "createdAt": "2024-07-25T02:00:00.000Z",
    "updatedAt": "2024-07-25T02:00:00.000Z",
    "displayName": "Tech Solutions Inc."
  }
}
```

---

### 📋 **PASO 2: Obtener todas las empresas del usuario**

**GET** `http://localhost:3000/companies`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Query Parameters opcionales:**
- `page=1` (página, default: 1)
- `limit=10` (elementos por página, default: 10)
- `search=Tech` (buscar en nombre/descripción)
- `isActive=true` (filtrar por estado activo)
- `sortBy=name` (ordenar por: name, createdAt, updatedAt)
- `sortOrder=ASC` (orden: ASC o DESC)

**Ejemplos de URLs:**
```
http://localhost:3000/companies
http://localhost:3000/companies?page=1&limit=5
http://localhost:3000/companies?search=tech
http://localhost:3000/companies?isActive=true&sortBy=name&sortOrder=ASC
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Companies retrieved successfully",
  "data": [
    {
      "id": "uuid-empresa-1",
      "name": "Tech Solutions Inc.",
      "displayName": "Tech Solutions Inc.",
      "isActive": true,
      "createdAt": "2024-07-25T02:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### 🔍 **PASO 3: Obtener una empresa específica por ID**

**GET** `http://localhost:3000/companies/{COMPANY_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Ejemplo:**
```
http://localhost:3000/companies/uuid-empresa-1
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company retrieved successfully",
  "data": {
    "id": "uuid-empresa-1",
    "name": "Tech Solutions Inc.",
    "taxId": "12-3456789-0",
    "address": "123 Innovation Ave, Tech City, TC 12345",
    "phone": "+1-555-123-4567",
    "email": "contact@techsolutions.com",
    "website": "https://www.techsolutions.com",
    "description": "Leading provider of innovative technology solutions",
    "isActive": true,
    "displayName": "Tech Solutions Inc."
  }
}
```

---

### 🌐 **PASO 4: Búsqueda pública de empresas (SIN autenticación)**

**GET** `http://localhost:3000/companies/public/search?q=Tech`

**⚠️ NO requiere Authorization header**

**Query Parameters:**
- `q=Tech` (término de búsqueda - REQUERIDO)
- `limit=10` (máximo resultados, default: 10)

**Ejemplos:**
```
http://localhost:3000/companies/public/search?q=Tech
http://localhost:3000/companies/public/search?q=Solutions&limit=5
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Public search completed successfully",
  "data": [
    {
      "id": "uuid-empresa-1",
      "name": "Tech Solutions Inc.",
      "website": "https://www.techsolutions.com",
      "description": "Leading provider of innovative technology solutions",
      "isActive": true
    }
  ]
}
```

---

### 📊 **PASO 5: Obtener estadísticas de empresas**

**GET** `http://localhost:3000/companies/stats`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total": 5,
    "active": 4,
    "inactive": 1,
    "withTaxId": 3,
    "withoutTaxId": 2
  }
}
```

---

### 🕒 **PASO 6: Obtener empresas recientes**

**GET** `http://localhost:3000/companies/recent`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Query Parameters opcionales:**
- `limit=5` (número de empresas, default: 5)

**Ejemplo:**
```
http://localhost:3000/companies/recent?limit=3
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Recent companies retrieved successfully",
  "data": [
    {
      "id": "uuid-empresa-reciente",
      "name": "New Startup LLC",
      "displayName": "New Startup LLC",
      "createdAt": "2024-07-25T02:30:00.000Z"
    }
  ]
}
```

---

### ✏️ **PASO 7: Actualizar información de empresa**

**PATCH** `http://localhost:3000/companies/{COMPANY_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON) - Campos opcionales:**
```json
{
  "name": "Tech Solutions Corporation",
  "phone": "+1-555-999-8888",
  "description": "Premier technology solutions provider with global reach",
  "website": "https://www.techsolutions.corp"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company updated successfully",
  "data": {
    "id": "uuid-empresa-1",
    "name": "Tech Solutions Corporation",
    "phone": "+1-555-999-8888",
    "description": "Premier technology solutions provider with global reach",
    "website": "https://www.techsolutions.corp",
    "displayName": "Tech Solutions Corporation",
    "updatedAt": "2024-07-25T03:00:00.000Z"
  }
}
```

---

### 🔄 **PASO 8: Cambiar estado de empresa (activar/desactivar)**

**PATCH** `http://localhost:3000/companies/{COMPANY_ID}/toggle-status`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company status updated successfully",
  "data": {
    "id": "uuid-empresa-1",
    "name": "Tech Solutions Corporation",
    "isActive": false,
    "displayName": "Tech Solutions Corporation"
  }
}
```

---

### 🌐 **PASO 9: Obtener información pública de empresa (SIN autenticación)**

**GET** `http://localhost:3000/companies/{COMPANY_ID}/public`

**⚠️ NO requiere Authorization header**

**Ejemplo:**
```
http://localhost:3000/companies/uuid-empresa-1/public
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Public company information retrieved successfully",
  "data": {
    "id": "uuid-empresa-1",
    "name": "Tech Solutions Corporation",
    "website": "https://www.techsolutions.corp",
    "description": "Premier technology solutions provider with global reach",
    "isActive": true
  }
}
```

---

### 🔍 **PASO 10: Buscar empresa por Tax ID**

**GET** `http://localhost:3000/companies/tax-id/{TAX_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Ejemplo:**
```
http://localhost:3000/companies/tax-id/12-3456789-0
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company found",
  "data": {
    "id": "uuid-empresa-1",
    "name": "Tech Solutions Corporation",
    "taxId": "12-3456789-0",
    "displayName": "Tech Solutions Corporation"
  }
}
```

---

### 🗑️ **PASO 11: Eliminar empresa (soft delete)**

**DELETE** `http://localhost:3000/companies/{COMPANY_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company deleted successfully"
}
```

**Nota:** Esto es un "soft delete" - la empresa se desactiva pero no se elimina de la base de datos.

## 3. Casos de prueba específicos

### ✅ **Probar validaciones:**

**Tax ID duplicado:**
```json
{
  "name": "Another Company",
  "taxId": "12-3456789-0"
}
```

**Nombre muy corto:**
```json
{
  "name": "A"
}
```

**Email inválido:**
```json
{
  "name": "Valid Company",
  "email": "email-malo"
}
```

**URL inválida:**
```json
{
  "name": "Valid Company",
  "website": "no-es-url"
}
```

**Descripción muy larga:**
```json
{
  "name": "Valid Company",
  "description": "Esta descripción tiene más de 1000 caracteres... [repetir hasta superar límite]"
}
```

### ✅ **Probar búsqueda y filtrado:**

```
GET /companies?search=tech
GET /companies?isActive=false
GET /companies?sortBy=name&sortOrder=ASC
GET /companies?page=2&limit=5&search=solutions
```

### ✅ **Probar casos de error:**

**Empresa inexistente:**
```
GET /companies/99999999-9999-9999-9999-999999999999
```

**UUID inválido:**
```
GET /companies/id-invalido
```

**Sin autorización:**
Hacer request sin el header `Authorization` en endpoints protegidos.

**Búsqueda pública sin término:**
```
GET /companies/public/search
```

## 4. Comandos cURL de ejemplo

### Crear empresa:
```bash
curl -X POST http://localhost:3000/companies \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Curl Company Ltd.",
    "taxId": "99-8877665-4",
    "address": "456 Terminal St",
    "email": "info@curlcompany.com"
  }'
```

### Listar empresas:
```bash
curl -X GET "http://localhost:3000/companies?page=1&limit=5" \
  -H "Authorization: Bearer TOKEN"
```

### Búsqueda pública:
```bash
curl -X GET "http://localhost:3000/companies/public/search?q=tech&limit=3"
```

### Actualizar empresa:
```bash
curl -X PATCH http://localhost:3000/companies/COMPANY_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Company Name"
  }'
```

### Obtener estadísticas:
```bash
curl -X GET http://localhost:3000/companies/stats \
  -H "Authorization: Bearer TOKEN"
```

## 5. Datos de prueba recomendados

### Empresa 1 - Tecnología:
```json
{
  "name": "InnovaTech Solutions",
  "taxId": "20-1234567-8",
  "address": "100 Silicon Valley Dr, Tech City, CA 94000",
  "phone": "+1-650-555-0100",
  "email": "contact@innovatech.com",
  "website": "https://www.innovatech.com",
  "description": "Cutting-edge technology solutions for enterprise clients worldwide"
}
```

### Empresa 2 - Consultoría:
```json
{
  "name": "Business Growth Consultants",
  "taxId": "30-9876543-2",
  "address": "500 Business Plaza, Financial District, NY 10005",
  "phone": "+1-212-555-0200",
  "email": "hello@bgconsultants.com",
  "website": "https://www.bgconsultants.com",
  "description": "Strategic business consulting for startups and Fortune 500 companies"
}
```

### Empresa 3 - E-commerce:
```json
{
  "name": "Digital Commerce Hub",
  "taxId": "40-5678901-2",
  "address": "200 E-commerce Way, Austin, TX 78701",
  "phone": "+1-512-555-0300",
  "email": "support@digitalcommerce.com",
  "website": "https://www.digitalcommerce.com",
  "description": "Complete e-commerce platform and digital marketplace solutions"
}
```

## 6. Qué verificar que funciona:

✅ **CRUD completo** de empresas
✅ **Validaciones robustas** (tax_id único, emails válidos, URLs válidas)
✅ **Paginación y búsqueda** avanzada
✅ **Búsqueda pública** sin autenticación
✅ **Filtrado por estado** activo/inactivo
✅ **Ordenamiento** por diferentes campos
✅ **Estadísticas** del sistema
✅ **Empresas recientes** ordenadas por fecha
✅ **Búsqueda por Tax ID** específica
✅ **Soft delete** (desactivación, no eliminación)
✅ **Toggle de estado** (activar/desactivar)
✅ **Información pública** vs privada
✅ **Autenticación requerida** en endpoints privados
✅ **Serialización correcta** de datos
✅ **Manejo de errores** consistente

## 7. Funcionalidades específicas a probar:

- **displayName** se genera automáticamente
- **Tax ID único** se valida correctamente
- **Fechas automáticas** (createdAt, updatedAt)
- **UUIDs** se generan automáticamente
- **Soft delete** mantiene datos en BD
- **Búsqueda case-insensitive** funciona
- **Paginación** calcula correctamente totalPages
- **Filtros combinados** funcionan juntos

¡Prueba estos endpoints siguiendo el orden recomendado y verifica que todo funcione correctamente! 🚀
