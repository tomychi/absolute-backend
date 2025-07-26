# 🏪 Sistema de Sucursales/Branches - Flujo Completo

## 🎯 **Concepto general:**

Una **sucursal/branch** es un punto físico o lógico donde la empresa opera. Puede ser:
- 🏪 **Tienda física** (local de ventas)
- 🏭 **Depósito/Almacén** (solo almacenamiento)
- 🏢 **Oficina** (administrativa)
- 🚚 **Centro de distribución**
- 💻 **Tienda online** (virtual)

---

## 🏗️ **Arquitectura del sistema:**

```
COMPANY (Empresa)
└── BRANCHES (Sucursales)
    ├── Branch 1: "Tienda Centro" (Retail)
    ├── Branch 2: "Depósito Norte" (Warehouse)
    ├── Branch 3: "Oficina Matriz" (Office)
    └── Branch 4: "Tienda Online" (Virtual)
        └── INVENTORY (Stock por sucursal)
            ├── Product A: 50 unidades
            ├── Product B: 25 unidades
            └── Product C: 0 unidades
```

---

## 📊 **Modelo de datos propuesto:**

### **Tabla branches:**
```sql
id              uuid (PK)
company_id      uuid (FK → companies.id)
name            varchar (ej: "Tienda Centro")
code            varchar (ej: "TC001")
type            enum (retail, warehouse, office, virtual)
address         text
phone           varchar
email           varchar
manager_user_id uuid (FK → users.id)
is_active       boolean
is_main         boolean (sucursal principal)
latitude        decimal (para geolocalización)
longitude       decimal
business_hours  json (horarios de atención)
created_at      timestamp
updated_at      timestamp
```

### **Tipos de sucursales:**
- **RETAIL** - Punto de venta al público
- **WAREHOUSE** - Depósito/almacén
- **OFFICE** - Oficina administrativa
- **VIRTUAL** - Tienda online
- **DISTRIBUTION** - Centro de distribución

---

## 🔄 **Flujos principales:**

### **1. Creación de sucursales:**
```
Owner/Admin crea empresa
└── Automáticamente se crea "Sucursal Principal"
    └── Owner puede crear sucursales adicionales
        └── Asignar manager a cada sucursal
```

### **2. Gestión de inventory por sucursal:**
```
Producto X existe en:
├── Sucursal A: 100 unidades
├── Sucursal B: 50 unidades
└── Sucursal C: 0 unidades (agotado)

Movimientos de stock:
├── Compra → Ingresa a sucursal específica
├── Venta → Sale de sucursal específica
├── Transferencia → De sucursal A a sucursal B
└── Ajuste → Corrección de inventario
```

### **3. Permisos por sucursal:**
```
Usuario puede tener diferentes roles por sucursal:
├── Manager en Sucursal A
├── Employee en Sucursal B
└── Sin acceso a Sucursal C
```

---

## 🎯 **Casos de uso reales:**

### **Ejemplo 1: Cadena de tiendas**
```
TechCorp Solutions
├── Tienda Shopping Norte (Retail)
│   ├── Manager: Juan Pérez
│   ├── Employees: 3 vendedores
│   └── Stock: Productos de alta rotación
├── Tienda Centro (Retail)
│   ├── Manager: María García
│   └── Stock: Línea premium
└── Depósito Central (Warehouse)
    ├── Manager: Carlos López
    └── Stock: Inventario principal
```

### **Ejemplo 2: Restaurante con delivery**
```
Burger King Córdoba
├── Local Principal (Retail)
│   ├── Cocina + Salón
│   └── Stock: Ingredientes del día
├── Cocina Dark Kitchen (Warehouse)
│   ├── Solo delivery
│   └── Stock: Ingredientes para pedidos online
└── Oficina Administrativa (Office)
    └── Sin stock físico
```

---

## 📋 **Funcionalidades del módulo Branches:**

### **🏪 CRUD de sucursales:**
- ✅ Crear sucursal (solo owner/admin)
- ✅ Listar sucursales de la empresa
- ✅ Actualizar datos de sucursal
- ✅ Activar/desactivar sucursal
- ✅ Asignar manager a sucursal

### **👥 Gestión de personal por sucursal:**
- ✅ Asignar usuarios a sucursales específicas
- ✅ Diferentes roles por sucursal
- ✅ Horarios de trabajo por sucursal
- ✅ Acceso restringido por sucursal

### **📦 Inventory multi-sucursal:**
- ✅ Stock independiente por sucursal
- ✅ Transferencias entre sucursales
- ✅ Alertas de stock bajo por sucursal
- ✅ Reportes de movimientos por sucursal

### **🧾 Ventas por sucursal:**
- ✅ Facturas asociadas a sucursal específica
- ✅ Reportes de ventas por sucursal
- ✅ Comisiones por vendedor/sucursal
- ✅ Metas de ventas por sucursal

---

## 🔐 **Sistema de permisos multi-sucursal:**

### **Niveles de acceso:**
```
COMPANY LEVEL (Nivel empresa):
├── Owner: Acceso a todas las sucursales
├── Admin: Acceso a todas las sucursales
└── Manager: Acceso a sucursales asignadas

BRANCH LEVEL (Nivel sucursal):
├── Branch Manager: Control total de SU sucursal
├── Branch Employee: Operaciones en SU sucursal
└── Branch Viewer: Solo lectura en SU sucursal
```

### **Tabla user_branch_access:**
```sql
id              uuid (PK)
user_company_id uuid (FK → user_companies.id)
branch_id       uuid (FK → branches.id)
access_level    enum (manager, employee, viewer)
can_transfer    boolean (transferir stock)
can_adjust      boolean (ajustar inventario)
is_active       boolean
```

---

## 🎮 **Endpoints propuestos:**

### **Gestión de sucursales:**
```
POST   /companies/{id}/branches           # Crear sucursal
GET    /companies/{id}/branches           # Listar sucursales
GET    /branches/{id}                     # Obtener sucursal específica
PATCH  /branches/{id}                     # Actualizar sucursal
DELETE /branches/{id}                     # Eliminar/desactivar sucursal
PATCH  /branches/{id}/toggle-status       # Activar/desactivar
```

### **Personal por sucursal:**
```
POST   /branches/{id}/assign-user         # Asignar usuario a sucursal
GET    /branches/{id}/users               # Ver personal de sucursal
PATCH  /branches/{id}/users/{userId}/role # Cambiar rol en sucursal
DELETE /branches/{id}/users/{userId}      # Remover de sucursal
```

### **Inventory por sucursal:**
```
GET    /branches/{id}/inventory           # Stock de sucursal
POST   /branches/{id}/inventory/transfer  # Transferir entre sucursales
POST   /branches/{id}/inventory/adjust    # Ajustar stock
GET    /branches/{id}/movements           # Movimientos de stock
```

### **Reportes por sucursal:**
```
GET    /branches/{id}/sales               # Ventas de sucursal
GET    /branches/{id}/reports/daily       # Reporte diario
GET    /branches/{id}/performance         # Performance de sucursal
```

---

## 🔄 **Integración con módulos existentes:**

### **Companies Module:**
```typescript
// Al crear empresa, crear sucursal principal automáticamente
async create(createCompanyDto, userId) {
  const company = await this.createCompany(createCompanyDto);

  // Crear sucursal principal
  await this.branchesService.createMainBranch(company.id, userId);

  return company;
}
```

### **User-Companies Module:**
```typescript
// Usuarios pueden tener acceso a sucursales específicas
interface UserBranchAccess {
  branchId: string;
  accessLevel: 'manager' | 'employee' | 'viewer';
  permissions: string[];
}
```

### **Products Module (futuro):**
```typescript
// Productos pueden tener diferentes precios por sucursal
interface ProductBranchPrice {
  productId: string;
  branchId: string;
  price: number;
  cost: number;
}
```

---

## 📈 **Beneficios del sistema:**

### **Para el negocio:**
- 🎯 **Control granular** por punto de venta
- 📊 **Reportes específicos** por sucursal
- 🚚 **Optimización logística** (transferencias)
- 💰 **Análisis de rentabilidad** por sucursal

### **Para los usuarios:**
- 🔐 **Acceso controlado** a sucursales asignadas
- ⚡ **Operaciones eficientes** en su punto
- 📱 **App móvil** específica por sucursal
- 👥 **Gestión de equipos** por locación

### **Para el sistema:**
- 🏗️ **Escalabilidad** para grandes cadenas
- 🔄 **Sincronización** entre sucursales
- 📦 **Trazabilidad** completa de productos
- 🛡️ **Seguridad** multi-nivel

---

## 🚀 **Orden de implementación sugerido:**

### **Fase 1: Branches básico**
1. ✅ Entidad Branch
2. ✅ CRUD de sucursales
3. ✅ Sucursal principal automática
4. ✅ Asignación de managers

### **Fase 2: Multi-branch access**
1. ✅ Permisos por sucursal
2. ✅ User-branch relationships
3. ✅ Filtrado por sucursal
4. ✅ Endpoints de gestión

### **Fase 3: Inventory multi-sucursal**
1. ✅ Stock por sucursal
2. ✅ Transferencias entre sucursales
3. ✅ Movimientos de stock
4. ✅ Alertas y reportes

### **Fase 4: Features avanzados**
1. ✅ Geolocalización
2. ✅ Horarios de atención
3. ✅ Reportes avanzados
4. ✅ Optimización logística

---

## 🎯 **¿Te parece bien este enfoque?**

**Ventajas:**
- 🏗️ **Base sólida** para inventory y sales
- 🔄 **Escalable** para cualquier tipo de negocio
- 🎯 **Flexible** (retail, warehouse, virtual)
- 💪 **Profesional** como sistemas ERP reales
