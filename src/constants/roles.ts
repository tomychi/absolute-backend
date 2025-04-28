export enum ROLES {
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
  USER = 'USER',
}

export enum ACCESS_LEVEL {
  OWNER = 50, // Dueño de la empresa o acceso total
  ADMINISTRATOR = 40, // Administrador general o gerente de alto nivel
  AREA_MANAGER = 30, // Jefe de área o gerente de departamento
  SUPERVISOR = 20, // Supervisor de equipo o responsable de turno
  EMPLOYEE = 10, // Empleado regular (vendedores, operarios, etc.)
}

// OWNER (50):

//     Nivel más alto de acceso.
//     El propietario o socio principal de la empresa con acceso total a todas las áreas, tanto operativas como financieras.
//     Puede realizar cambios estructurales en la empresa, gestionar usuarios y roles, y ver todos los reportes.

// ADMINISTRATOR (40):

//     Gerente general o administrador de la empresa.
//     Tiene acceso a todas las áreas, pero con foco en la gestión y administración diaria de la empresa (por ejemplo, manejo de cuentas, finanzas, control de inventarios, decisiones estratégicas).
//     Puede crear, editar o eliminar cuentas de empleados, así como asignar roles.

// AREA_MANAGER (30):

//     Jefe de un departamento específico (ventas, logística, finanzas, etc.).
//     Tiene acceso y control sobre las operaciones dentro de su área, incluyendo la supervisión de empleados, generación de reportes y gestión de recursos.
//     Puede aprobar o modificar procesos dentro de su departamento y gestionar el rendimiento de su equipo.

// SUPERVISOR (20):

//     Supervisor de equipo o encargado de un grupo específico de empleados.
//     Tiene acceso para gestionar las tareas diarias de su equipo, como asignación de trabajos, revisión de rendimiento, y reporte de avances.
//     No tiene acceso a los aspectos financieros o estratégicos más altos de la empresa.

// EMPLOYEE (10):

//     Empleado regular, como vendedores, operarios o cualquier personal de apoyo.
//     Acceso limitado a las funciones necesarias para realizar su trabajo diario (por ejemplo, crear pedidos, gestionar clientes, actualizar inventarios).
//     No tiene acceso a áreas de administración, finanzas o gestión de otros empleados.
