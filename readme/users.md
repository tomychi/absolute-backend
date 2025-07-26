# 👥 Guía Completa para Probar el Módulo de Usuarios

## 1. Preparación inicial

### ⚠️ **IMPORTANTE:** Necesitas estar autenticado
Primero haz login en `/auth/login` y guarda el `accessToken` para usar en todos estos endpoints.

## 2. Probar con Postman/Thunder Client

### 👤 **PASO 1: Crear un nuevo usuario**

**POST** `http://localhost:3000/users`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@company.com",
  "password": "AdminPass123!",
  "firstName": "Admin",
  "lastName": "User",
  "phone": "+1987654321",
  "isActive": true
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid-nuevo-usuario",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "phone": "+1987654321",
    "isActive": true,
    "emailVerified": false,
    "createdAt": "2024-07-25T01:00:00.000Z"
  }
}
```

---

### 📋 **PASO 2: Obtener todos los usuarios (con paginación)**

**GET** `http://localhost:3000/users`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Query Parameters opcionales:**
- `page=1` (página, default: 1)
- `limit=10` (elementos por página, default: 10)
- `search=Admin` (buscar en nombre/email)
- `sortBy=firstName` (ordenar por campo)
- `sortOrder=ASC` (orden: ASC o DESC)

**Ejemplos de URLs:**
```
http://localhost:3000/users
http://localhost:3000/users?page=1&limit=5
http://localhost:3000/users?search=admin
http://localhost:3000/users?sortBy=createdAt&sortOrder=DESC
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid-1",
      "email": "test@example.com",
      "firstName": "John",
      "fullName": "John Doe"
    },
    {
      "id": "uuid-2",
      "email": "admin@company.com",
      "firstName": "Admin",
      "fullName": "Admin User"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "totalPages": 1
  }
}
```

---

### 🔍 **PASO 3: Obtener un usuario específico por ID**

**GET** `http://localhost:3000/users/{USER_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Ejemplo:**
```
http://localhost:3000/users/e3aa7824-ffd0-416a-8f30-5a120ee006fe
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "e3aa7824-ffd0-416a-8f30-5a120ee006fe",
    "email": "admin@company.com",
    "firstName": "Admin",
    "lastName": "User",
    "fullName": "Admin User",
    "phone": "+1987654321",
    "isActive": true
  }
}
```

---

### ✏️ **PASO 4: Actualizar información de usuario**

**PATCH** `http://localhost:3000/users/{USER_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON) - Campos opcionales:**
```json
{
  "firstName": "Administrator",
  "lastName": "Master",
  "phone": "+1555000123"
}
```

**Nota:** Puedes actualizar solo los campos que necesites, no es necesario enviar todos.

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": "uuid-usuario",
    "email": "admin@company.com",
    "firstName": "Administrator",
    "lastName": "Master",
    "fullName": "Administrator Master",
    "phone": "+1555000123"
  }
}
```

---

### 🔐 **PASO 5: Cambiar contraseña de usuario**

**PATCH** `http://localhost:3000/users/{USER_ID}/change-password`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "currentPassword": "AdminPass123!",
  "newPassword": "NewAdminPass456!"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 🔄 **PASO 6: Cambiar estado de usuario (activar/desactivar)**

**PATCH** `http://localhost:3000/users/{USER_ID}/toggle-status`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User status updated successfully",
  "data": {
    "id": "uuid-usuario",
    "email": "admin@company.com",
    "firstName": "Administrator",
    "isActive": false
  }
}
```

---

### 👁️ **PASO 7: Obtener perfil completo de usuario**

**GET** `http://localhost:3000/users/{USER_ID}/profile`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "uuid-usuario",
    "email": "admin@company.com",
    "firstName": "Administrator",
    "fullName": "Administrator Master",
    "lastLogin": "2024-07-25T01:15:00.000Z"
  }
}
```

---

### 🗑️ **PASO 8: Eliminar usuario (soft delete)**

**DELETE** `http://localhost:3000/users/{USER_ID}`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Nota:** Esto es un "soft delete" - el usuario se desactiva pero no se elimina de la base de datos.

## 3. Casos de prueba específicos

### ✅ **Probar validaciones:**

**Email duplicado:**
```json
{
  "email": "test@example.com",
  "password": "ValidPass123!",
  "firstName": "Duplicate"
}
```

**Email inválido:**
```json
{
  "email": "email-malo",
  "password": "ValidPass123!",
  "firstName": "Test"
}
```

**Contraseña débil:**
```json
{
  "email": "weak@example.com",
  "password": "123",
  "firstName": "Test"
}
```

**Teléfono inválido:**
```json
{
  "email": "phone@example.com",
  "password": "ValidPass123!",
  "firstName": "Test",
  "phone": "telefono-malo"
}
```

### ✅ **Probar paginación y búsqueda:**

```
GET /users?page=1&limit=2
GET /users?search=admin
GET /users?sortBy=email&sortOrder=ASC
GET /users?page=2&limit=5&search=test&sortBy=createdAt
```

### ✅ **Probar casos de error:**

**Usuario inexistente:**
```
GET /users/99999999-9999-9999-9999-999999999999
```

**UUID inválido:**
```
GET /users/id-invalido
```

**Sin autorización:**
Hacer cualquier request sin el header `Authorization`.

## 4. Comandos cURL de ejemplo

### Crear usuario:
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "password": "CurlPass123!",
    "firstName": "Curl",
    "lastName": "User"
  }'
```

### Listar usuarios:
```bash
curl -X GET "http://localhost:3000/users?page=1&limit=5" \
  -H "Authorization: Bearer TOKEN"
```

### Obtener usuario específico:
```bash
curl -X GET http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer TOKEN"
```

### Actualizar usuario:
```bash
curl -X PATCH http://localhost:3000/users/USER_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Updated Name"
  }'
```

## 5. Qué verificar que funciona:

✅ **CRUD completo** de usuarios
✅ **Paginación** con page y limit
✅ **Búsqueda** por nombre y email
✅ **Ordenamiento** por diferentes campos
✅ **Validaciones** de email, contraseña, teléfono
✅ **Cambio de contraseña** seguro
✅ **Toggle de estado** (activar/desactivar)
✅ **Soft delete** (no eliminación real)
✅ **Autenticación requerida** en todos los endpoints
✅ **Manejo de errores** consistente
✅ **Serialización** correcta (no muestra campos sensibles)

## 6. Funcionalidades específicas a probar:

- **fullName** se genera automáticamente
- **Contraseñas se hashean** antes de guardar
- **Emails únicos** se validan
- **Fechas automáticas** (createdAt, updatedAt)
- **UUIDs** se generan automáticamente

¡Prueba estos endpoints y verifica que todo funcione correctamente! 🚀
