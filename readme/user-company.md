# 🏢 Guía Completa - Sistema Multi-Tenant User-Companies

## 🎯 **Flujo completo que vamos a probar:**

1. **Usuario 1** crea empresa → Se convierte en OWNER automáticamente
2. **Usuario 1** (owner) invita a **Usuario 2** como MANAGER
3. **Usuario 2** acepta invitación y puede ver la empresa
4. **Usuario 1** invita a **Usuario 3** como EMPLOYEE
5. **Usuario 1** cambia rol de Usuario 2 a ADMIN
6. **Usuario 2** (admin) puede gestionar Usuario 3 pero no Usuario 1
7. **Verificar permisos** granulares por módulo

---

## 📋 **PASO 1: Preparación inicial**

### **A. Registrar 3 usuarios diferentes:**

**Usuario 1 (será Owner):**
```json
POST /auth/register
{
  "email": "owner@techcorp.com",
  "password": "Owner123!",
  "firstName": "Alice",
  "lastName": "Owner"
}
```

**Usuario 2 (será Manager/Admin):**
```json
POST /auth/register
{
  "email": "manager@techcorp.com",
  "password": "Manager123!",
  "firstName": "Bob",
  "lastName": "Manager"
}
```

**Usuario 3 (será Employee):**
```json
POST /auth/register
{
  "email": "employee@techcorp.com",
  "password": "Employee123!",
  "firstName": "Carol",
  "lastName": "Employee"
}
```

### **B. Guardar tokens de cada usuario:**
- `ownerToken` = token de Alice
- `managerToken` = token de Bob
- `employeeToken` = token de Carol

---

## 🏢 **PASO 2: Usuario 1 crea empresa (automáticamente se vuelve OWNER)**

**Request:**
```http
POST /companies
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "name": "TechCorp Solutions",
  "taxId": "99-8877665-4",
  "address": "100 Innovation Drive, Tech City",
  "email": "contact@techcorp.com",
  "website": "https://techcorp.com",
  "description": "Leading technology solutions provider"
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Company created successfully",
  "data": {
    "id": "company-uuid-here",
    "name": "TechCorp Solutions",
    "taxId": "99-8877665-4"
  }
}
```

**📝 Guarda el `companyId` para los siguientes pasos!**

---

## 👥 **PASO 3: Verificar que Usuario 1 es OWNER automáticamente**

**Request:**
```http
GET /user-companies/my-companies
Authorization: Bearer {{ownerToken}}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User companies retrieved successfully",
  "data": [
    {
      "id": "user-company-uuid",
      "companyId": "company-uuid-here",
      "roleName": "owner",
      "status": "active",
      "isActive": true,
      "company": {
        "name": "TechCorp Solutions"
      }
    }
  ]
}
```

---

## 📧 **PASO 4: Owner invita a Usuario 2 como MANAGER**

**Request:**
```http
POST /user-companies/invite
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "email": "manager@techcorp.com",
  "firstName": "Bob",
  "lastName": "Manager",
  "companyId": "{{companyId}}",
  "accessLevelId": 3,
  "message": "Welcome to TechCorp! You've been invited as a Manager."
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User invited successfully",
  "data": {
    "id": "invitation-uuid",
    "userId": "user2-uuid",
    "companyId": "company-uuid",
    "roleName": "manager",
    "status": "pending"
  }
}
```

---

## ✅ **PASO 5: Usuario 2 acepta invitación**

**Request:**
```http
POST /user-companies/{{invitation-uuid}}/accept
Authorization: Bearer {{managerToken}}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Invitation accepted successfully",
  "data": {
    "id": "invitation-uuid",
    "status": "active",
    "joinedAt": "2024-07-25T03:00:00.000Z"
  }
}
```

---

## 👀 **PASO 6: Usuario 2 verifica que puede ver la empresa**

**Request:**
```http
GET /user-companies/my-companies
Authorization: Bearer {{managerToken}}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "companyId": "company-uuid",
      "roleName": "manager",
      "status": "active",
      "company": {
        "name": "TechCorp Solutions"
      }
    }
  ]
}
```

---

## 🔐 **PASO 7: Verificar permisos de Usuario 2 (Manager)**

**Request:**
```http
GET

Authorization: Bearer {{managerToken}}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "role": "manager",
    "hierarchyLevel": 3,
    "permissions": [
      {
        "module": "products",
        "canRead": true,
        "canWrite": true,
        "canDelete": false,
        "canExport": true,
        "canImport": true
      },
      {
        "module": "users",
        "canRead": true,
        "canWrite": false,
        "canDelete": false
      }
    ]
  }
}
```

---

## 👥 **PASO 8: Owner invita a Usuario 3 como EMPLOYEE**

**Request:**
```http
POST /user-companies/invite
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "email": "employee@techcorp.com",
  "firstName": "Carol",
  "lastName": "Employee",
  "companyId": "{{companyId}}",
  "accessLevelId": 2,
  "message": "Welcome to the TechCorp team!"
}
```

---

## ✅ **PASO 9: Usuario 3 acepta y verifica permisos**

**Aceptar invitación:**
```http
POST /user-companies/{{invitation-uuid}}/accept
Authorization: Bearer {{employeeToken}}
```

**Verificar permisos de Employee:**
```http
GET /user-companies/company/{{companyId}}/my-permissions
Authorization: Bearer {{employeeToken}}
```

**Permisos esperados para Employee:**
```json
{
  "role": "employee",
  "hierarchyLevel": 2,
  "permissions": [
    {
      "module": "products",
      "canRead": true,
      "canWrite": false,
      "canDelete": false
    },
    {
      "module": "inventory",
      "canRead": true,
      "canWrite": true,
      "canDelete": false
    },
    {
      "module": "users",
      "canRead": false,
      "canWrite": false,
      "canDelete": false
    }
  ]
}
```

---

## 🔄 **PASO 10: Owner cambia rol de Usuario 2 a ADMIN**

**Ver miembros de la empresa:**
```http
GET /user-companies/company/{{companyId}}/members
Authorization: Bearer {{ownerToken}}
```

**Cambiar rol (usar el user-company ID del manager):**
```http
PATCH /user-companies/{{manager-user-company-id}}/role
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "accessLevelId": 4
}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "data": {
    "roleName": "admin",
    "hierarchyLevel": 4
  }
}
```

---

## 🛡️ **PASO 11: Probar jerarquía de permisos**

### **A. Admin (Usuario 2) puede gestionar Employee (Usuario 3):**

**Request (exitoso):**
```http
PATCH /user-companies/{{employee-user-company-id}}/role
Authorization: Bearer {{managerToken}}
Content-Type: application/json

{
  "accessLevelId": 1
}
```

### **B. Admin NO puede gestionar Owner (Usuario 1):**

**Request (fallará):**
```http
PATCH /user-companies/{{owner-user-company-id}}/role
Authorization: Bearer {{managerToken}}
Content-Type: application/json

{
  "accessLevelId": 1
}
```

**Respuesta esperada (error):**
```json
{
  "statusCode": 403,
  "message": "You cannot change the role of this user"
}
```

---

## 📊 **PASO 12: Probar filtrado multi-tenant**

### **A. Usuario 3 trata de acceder a empresa donde no es miembro:**

**Crear segunda empresa con Usuario 1:**
```http
POST /companies
Authorization: Bearer {{ownerToken}}

{
  "name": "SecondCorp Ltd",
  "description": "Second company for testing"
}
```

**Usuario 3 trata de ver miembros de segunda empresa:**
```http
GET /user-companies/company/{{secondCompanyId}}/members
Authorization: Bearer {{employeeToken}}
```

**Respuesta esperada (error):**
```json
{
  "statusCode": 403,
  "message": "You do not have access to this company"
}
```

### **B. Verificar que cada usuario solo ve SUS empresas:**

**Usuario 1 ve ambas empresas:**
```http
GET /user-companies/my-companies
Authorization: Bearer {{ownerToken}}
```

**Usuario 2 y 3 solo ven la primera empresa:**
```http
GET /user-companies/my-companies
Authorization: Bearer {{managerToken}}
```

---

## 🔄 **PASO 13: Probar cambio de empresa activa**

**Usuario 1 cambia a segunda empresa:**
```http
POST /user-companies/switch-company
Authorization: Bearer {{ownerToken}}
Content-Type: application/json

{
  "companyId": "{{secondCompanyId}}"
}
```

---

## 📋 **PASO 14: Obtener niveles de acceso disponibles**

**Request:**
```http
GET /user-companies/access-levels
Authorization: Bearer {{ownerToken}}
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "name": "owner",
      "hierarchyLevel": 5,
      "description": "Company owner with full control"
    },
    {
      "id": 4,
      "name": "admin",
      "hierarchyLevel": 4,
      "description": "Administrator with broad permissions"
    },
    {
      "id": 3,
      "name": "manager",
      "hierarchyLevel": 3,
      "description": "Manager with operational permissions"
    },
    {
      "id": 2,
      "name": "employee",
      "hierarchyLevel": 2,
      "description": "Employee with basic permissions"
    },
    {
      "id": 1,
      "name": "viewer",
      "hierarchyLevel": 1,
      "description": "Read-only access"
    }
  ]
}
```

---

## ✅ **VERIFICACIONES FINALES**

### **1. Multi-tenant completo:**
- ✅ Usuario solo ve empresas donde es miembro
- ✅ Acceso denegado a empresas ajenas
- ✅ Filtrado automático por empresa

### **2. Jerarquía de roles:**
- ✅ Owner puede gestionar a todos
- ✅ Admin puede gestionar Manager/Employee/Viewer
- ✅ Manager NO puede gestionar Admin/Owner
- ✅ Employee NO puede gestionar a nadie

### **3. Permisos granulares:**
- ✅ Owner: todos los permisos
- ✅ Admin: casi todos los permisos
- ✅ Manager: permisos operacionales
- ✅ Employee: permisos básicos
- ✅ Viewer: solo lectura

### **4. Sistema de invitaciones:**
- ✅ Invitación por email
- ✅ Estado pendiente → activo
- ✅ Validación de permisos del invitador

### **5. Integración con Companies:**
- ✅ Creación automática de relación owner
- ✅ Usuario se convierte en owner al crear empresa
