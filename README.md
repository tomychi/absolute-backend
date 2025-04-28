# Absolute API

Bienvenido a la documentación de la API de Absolute. Este README proporciona una guía paso a paso para levantar y ejecutar la API de Absolute.

## Prerequisitos

Asegúrate de tener instalados los siguientes elementos en tu sistema:

* Docker (para contenedores y orquestación)
* Node.js (para ejecutar comandos de npm)
* npm (gestor de paquetes para Node.js)

## Pasos para Levantar la API

Sigue estos pasos para levantar y ejecutar la API de Absolute:

### 1. Levantar Docker

Primero, asegúrate de que Docker esté en funcionamiento. Esto se hace levantando los contenedores definidos en el archivo `docker-compose.yml`.

* `docker compose up -d`: Inicia los contenedores en segundo plano (`-d` para "detached mode"). Esto levantará todos los servicios definidos en el archivo `docker-compose.yml`, como la base de datos y otros servicios necesarios para tu aplicación.

### 2. Generar Migraciones de la Base de Datos

Antes de ejecutar la API, asegúrate de que la base de datos esté configurada correctamente. Esto implica generar las migraciones necesarias para estructurar la base de datos.
* `npm run m:gen -- src/migrations/init`: Este comando genera nuevas migraciones para la base de datos. El flag `--` pasa parámetros adicionales al script, en este caso, especifica la ruta donde se encuentran los archivos de migración (`src/migrations/init`).

### 3. Ejecutar Migraciones

Aplica las migraciones generadas a la base de datos para crear o actualizar la estructura de la base de datos.
* `npm run m:run`: Ejecuta las migraciones pendientes en la base de datos. Esto actualiza la estructura de la base de datos según las migraciones generadas en el paso anterior.

### 4. Iniciar la API en Modo de Desarrollo

Finalmente, inicia la API en modo de desarrollo para comenzar a trabajar con ella.
* `npm run start:dev`: Arranca la aplicación en modo de desarrollo. Este comando inicia el servidor en modo de desarrollo, lo que permite recarga automática y otras características útiles para el desarrollo.

## Notas Adicionales

* Asegúrate de tener configurados los archivos de configuración necesarios para la conexión a la base de datos y otros servicios.
* Si realizas cambios en las entidades o en la estructura de la base de datos, es posible que necesites volver a generar y ejecutar las migraciones.
* Revisa los logs de Docker y de la API si encuentras problemas para obtener más información sobre posibles errores.

## Absolute API Endpoints

## User Endpoints

### Register User

#### POST `/register`

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "password": "string",
  "role": "ROLES"
}
```
### Get All Users
### GET /all
### GET /:userId
**Parameters:**
```userId: string (UUID)```
### PUT /edit/:userId
**Parameters:**
```userId: string (UUID)```
``` json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "email": "string (optional)",
  "password": "string (optional)",
  "role": "ROLES (optional)"
}
```

### DELETE /delete/:userId
**Parameters:**
```userId: string (UUID)```

### POST /add-to-company
**Request Body:**
```json
{
  "user": "UserEntity",
  "company": "CompanyEntity",
  "accessLevel": "ACCESS_LEVEL"
}
```
¡Gracias por usar Absolute! Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.
