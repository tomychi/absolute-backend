# 🚀 Guía Completa para Probar la Autenticación

## 1. Preparación inicial

### Instalar dependencias faltantes:
```bash
npm install @nestjs/throttler
```

### Verificar que compile:
```bash
npm run build
```

### Ejecutar servidor:
```bash
npm run start:dev
```

## 2. Probar con Postman/Thunder Client

### 📝 **PASO 1: Registrar un nuevo usuario**

**POST** `http://localhost:3000/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-aqui",
      "email": "test@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "isActive": true,
      "emailVerified": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresAt": "2024-07-25T01:00:00.000Z"
    }
  }
}
```

---

### 🔐 **PASO 2: Login con el usuario**

**POST** `http://localhost:3000/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

**⚠️ Guarda el `accessToken` de la respuesta para los siguientes pasos!**

---

### 👤 **PASO 3: Obtener perfil del usuario autenticado**

**GET** `http://localhost:3000/auth/profile`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "uuid-aqui",
    "email": "test@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "fullName": "John Doe"
  }
}
```

---

### 👥 **PASO 4: Obtener información del usuario actual**

**GET** `http://localhost:3000/auth/me`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

---

### 🔄 **PASO 5: Renovar token**

**POST** `http://localhost:3000/auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "refreshToken": "TU_REFRESH_TOKEN_AQUI"
}
```

---

### 🔒 **PASO 6: Cambiar contraseña**

**POST** `http://localhost:3000/auth/change-password`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

---

### 📊 **PASO 7: Estadísticas de autenticación**

**GET** `http://localhost:3000/auth/stats`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

---

### 🚪 **PASO 8: Logout**

**POST** `http://localhost:3000/auth/logout`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

---

### 🚪 **PASO 9: Logout de todos los dispositivos**

**POST** `http://localhost:3000/auth/logout-all`

**Headers:**
```
Authorization: Bearer TU_ACCESS_TOKEN_AQUI
```

## 3. Probar funcionalidades de seguridad

### ✅ **Probar validaciones:**

**Registro con email inválido:**
```json
{
  "email": "email-invalido",
  "password": "SecurePass123!",
  "firstName": "John"
}
```

**Contraseña débil:**
```json
{
  "email": "test2@example.com",
  "password": "123",
  "firstName": "John"
}
```

### ✅ **Probar rate limiting:**

Haz más de 5 requests de login en 1 minuto para ver el rate limiting en acción.

### ✅ **Probar rutas protegidas sin token:**

Intenta acceder a `/auth/profile` sin el header `Authorization`.

## 4. Ver documentación Swagger

Ve a: `http://localhost:3000/api`

Ahí verás toda la documentación automática de tus endpoints.

## 5. Comandos cURL de ejemplo

### Registro:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "password": "SecurePass123!",
    "firstName": "Curl",
    "lastName": "User"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "password": "SecurePass123!"
  }'
```

### Perfil (reemplaza TOKEN):
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

## 6. Qué verificar que funciona:

✅ **Registro de usuarios** con validación de contraseña fuerte
✅ **Login** devuelve tokens JWT
✅ **Rutas protegidas** requieren autenticación
✅ **Refresh tokens** funcionan correctamente
✅ **Rate limiting** previene spam
✅ **Logout** invalida tokens
✅ **Cambio de contraseña** funciona
✅ **Validaciones** rechazan datos inválidos
✅ **Documentación Swagger** se genera automáticamente

¡Prueba estos endpoints y dime cómo va! 🚀
