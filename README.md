<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<h1 align="center">🚀 API NestJS Boilerplate REST</h1>

<p align="center">
  Un template moderno y robusto de <a href="http://nestjs.com" target="_blank">NestJS</a> para construir APIs REST escalables y eficientes.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://nodejs.org" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D22.x-brightgreen" alt="Node Version" /></a>
  <a href="https://pnpm.io" target="_blank"><img src="https://img.shields.io/badge/pnpm-%3E%3D10.x-orange" alt="PNPM Version" /></a>
</p>

## 📋 Descripción

Este boilerplate proporciona una base sólida para desarrollar APIs REST con NestJS, incluyendo las mejores prácticas, configuraciones de seguridad, testing, y herramientas de desarrollo modernas.

## ✨ Características

### 🏗️ Arquitectura

- **NestJS 11+** - Framework progresivo de Node.js
- **TypeScript** - Tipado estático para mayor robustez
- **Fastify** - Servidor web de alto rendimiento
- **TypeORM** - ORM para bases de datos
- **PostgreSQL** - Base de datos relacional
- **Arquitectura Hexagonal** - Separación clara de capas (Domain, Application, Infrastructure, Presentation)

### 🔒 Seguridad y Autenticación

- **JWT Authentication** - Autenticación basada en tokens JWT
- **RBAC (Role-Based Access Control)** - Control de acceso basado en roles y permisos
- **Password Hashing** - Encriptación de contraseñas con bcrypt
- **Guards y Decoradores** - Protección de rutas con guards personalizados
- **Helmet** - Protección de headers HTTP
- **CORS** - Configuración de Cross-Origin Resource Sharing
- **CSRF Protection** - Protección contra ataques CSRF
- **Validación de datos** - Con class-validator y class-transformer

### 🧪 Testing

- **Vitest** - Framework de testing moderno y rápido
- **Cobertura de código** - Reportes detallados con Istanbul
- **Tests E2E** - Pruebas de extremo a extremo
- **Tests unitarios** - Pruebas aisladas de componentes

### 🛠️ Herramientas de Desarrollo

- **ESLint** - Linting de código
- **Prettier** - Formateo automático de código
- **Husky** - Git hooks para calidad de código
- **Commitlint** - Validación de mensajes de commit
- **Swagger/OpenAPI** - Documentación automática de API
- **Pino Logger** - Sistema de logging estructurado

### 📦 Gestión de Dependencias

- **PNPM** - Gestor de paquetes eficiente
- **Docker** - Containerización
- **GitHub Actions** - CI/CD automatizado

### ⚡ Performance

- **Redis** - Cache en memoria
- **Compresión** - Optimización de respuestas
- **Health Checks** - Monitoreo de salud de la aplicación

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 22.x
- PNPM >= 10.x
- PostgreSQL
- Redis (opcional)

### Instalación

1. **Clona el repositorio**

   ```bash
   git clone https://github.com/Enrique2115/api-nestjs-boilerplate-rest.git
   cd api-nestjs-boilerplate-rest
   ```

2. **Instala las dependencias**

   ```bash
   pnpm install
   ```

3. **Configura las variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Edita el archivo `.env` con tus configuraciones:

   ```env
   APP_NAME=API-NestJS-Boilerplate
   NODE_ENV=development
   HOST=0.0.0.0
   PORT=3001

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # REDIS
   REDIS_HOST=tu_redis_host
   REDIS_USERNAME=default
   REDIS_PASSWORD=tu_api_password
   REDIS_PORT=6379

   # REDIS - Configuración avanzada (opcional)
   REDIS_DB=0
   REDIS_CONNECT_TIMEOUT=10000
   REDIS_COMMAND_TIMEOUT=5000
   REDIS_RETRY_DELAY_ON_FAILURE=100
   REDIS_MAX_RETRIES=3
   REDIS_ENABLE_TLS=false
   REDIS_TLS_REJECT_UNAUTHORIZED=true
   REDIS_POOL_SIZE=10
   REDIS_ENABLE_OFFLINE_QUEUE=true

   # BD
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
   # DATABASE_URL=postgresql://postgres:postgres@postgres-db:5432/postgres # Para usar con docker compose
   DATABASE_TYPE=postgres # Para usar con docker compose
   ```

4. **Ejecuta la aplicación**

   ```bash
   # Modo desarrollo
   pnpm run dev

   # Modo producción
   pnpm run build
   pnpm run start:prod
   ```

## 🐳 Docker

### Desarrollo con Docker Compose

```bash
# Levantar servicio en producción
docker compose up -d production

# Levantar Servicio en desarrollo
docker compose up -d development

# Ver logs
docker compose logs -f

# Detener servicios
docker compose down
```

### Build de imagen Docker

```bash
# Construir imagen
docker build -t api-nestjs-boilerplate .

# Ejecutar contenedor
docker run -p 3001:3001 api-nestjs-boilerplate
```

## 📝 Scripts Disponibles

```bash
# Desarrollo
pnpm run dev              # Inicia en modo desarrollo con hot-reload
pnpm run start:debug      # Inicia con debugger

# Producción
pnpm run build            # Construye la aplicación
pnpm run start:prod       # Inicia en modo producción

# Testing
pnpm run test             # Ejecuta todos los tests
pnpm run test:unit        # Tests unitarios
pnpm run test:e2e         # Tests end-to-end

# Calidad de código
pnpm run lint             # Ejecuta ESLint
pnpm run lint:fix         # Corrige errores de ESLint
pnpm run format           # Formatea código con Prettier
pnpm run typecheck        # Verifica tipos de TypeScript

# Documentación
pnpm run docss            # Genera documentación con Compodoc

# Utilidades
pnpm run clean            # Limpia archivos generados
```

## 📚 Estructura del Proyecto

```
src/
├── app.module.ts          # Módulo principal
├── main.ts               # Punto de entrada
├── config/               # Configuraciones
│   ├── constants.ts      # Constantes globales
│   ├── envs.ts          # Variables de entorno
│   ├── redis.config.ts  # Configuración Redis
│   └── swagger.config.ts # Configuración Swagger
├── core/                 # Módulos core
│   ├── health/          # Health checks
│   ├── infra/           # Infraestructura
│   └── redis/           # Configuración Redis
└── modules/             # Módulos de dominio
    ├── auth/            # Autenticación y autorización
    │   ├── application/ # Casos de uso, DTOs, Guards
    │   ├── domain/      # Entidades y constantes
    │   ├── infrastructure/ # Servicios e implementaciones
    │   └── presentation/   # Controladores
    ├── users/           # Gestión de usuarios
    │   ├── application/ # Casos de uso y DTOs
    │   ├── domain/      # Entidades y repositorios
    │   ├── infrastructure/ # Implementación de repositorios
    │   └── presentation/   # Controladores
    ├── roles/           # Gestión de roles
    │   ├── application/ # Casos de uso, Guards y DTOs
    │   ├── domain/      # Entidades y repositorios
    │   ├── infrastructure/ # Implementación de repositorios
    │   └── presentation/   # Controladores
    └── permission/      # Gestión de permisos
        ├── application/ # Casos de uso, Guards y DTOs
        ├── domain/      # Entidades y repositorios
        ├── infrastructure/ # Implementación de repositorios
        └── presentation/   # Controladores

tests/
├── e2e/                 # Tests end-to-end
├── unit/                # Tests unitarios
└── utils/               # Utilidades de testing
```

## 🌐 API Endpoints

### Health Check

- `GET /health` - Estado de la aplicación (devuelve estado de la base de datos)

### Autenticación

- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registrar nuevo usuario
- `POST /auth/change-password` - Cambiar contraseña (requiere autenticación)

### Gestión de Usuarios

- `GET /users` - Listar usuarios (requiere permisos)
- `POST /users` - Crear usuario (requiere permisos)
- `GET /users/:id` - Obtener usuario por ID
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario
- `POST /users/:id/assign-role` - Asignar rol a usuario

### Gestión de Roles

- `GET /roles` - Listar roles (solo admin)
- `POST /roles` - Crear rol (solo admin)
- `GET /roles/:id` - Obtener rol por ID
- `PUT /roles/:id` - Actualizar rol
- `DELETE /roles/:id` - Eliminar rol
- `POST /roles/:id/assign-permission` - Asignar permiso a rol

### Gestión de Permisos

- `GET /permissions` - Listar permisos
- `POST /permissions` - Crear permiso
- `GET /permissions/:id` - Obtener permiso por ID
- `PUT /permissions/:id` - Actualizar permiso
- `DELETE /permissions/:id` - Eliminar permiso

### Documentación

- `GET /docs` - Swagger UI (solo en desarrollo)
- `GET /api-json` - Especificación OpenAPI JSON

## 🔧 Configuración

### Variables de Entorno

| Variable       | Descripción                  | Valor por defecto        |
| -------------- | ---------------------------- | ------------------------ |
| `APP_NAME`     | Nombre de la aplicación      | `API-NestJS-Boilerplate` |
| `NODE_ENV`     | Entorno de ejecución         | `development`            |
| `HOST`         | Host del servidor            | `0.0.0.0`                |
| `PORT`         | Puerto del servidor          | `3001`                   |
| `JWT_SECRET`   | Clave secreta para JWT       | `your-secret-key`        |
| `DATABASE_URL` | URL de conexión a PostgreSQL | `postgresql://...`       |
| `REDIS_HOST`   | Host de Redis                | `localhost`              |
| `REDIS_PORT`   | Puerto de Redis              | `6379`                   |

### Sistema de Roles y Permisos

#### Roles por Defecto

- **admin**: Acceso completo al sistema
- **user**: Acceso limitado de usuario estándar

#### Permisos Disponibles

**Gestión de Usuarios:**

- `users:create` - Crear usuarios
- `users:read` - Leer información de usuarios
- `users:update` - Actualizar usuarios
- `users:delete` - Eliminar usuarios

**Gestión de Roles:**

- `roles:create` - Crear roles
- `roles:read` - Leer información de roles
- `roles:update` - Actualizar roles
- `roles:delete` - Eliminar roles

**Gestión de Permisos:**

- `permissions:create` - Crear permisos
- `permissions:read` - Leer información de permisos
- `permissions:update` - Actualizar permisos
- `permissions:delete` - Eliminar permisos

### Usuario Administrador por Defecto

Al iniciar la aplicación por primera vez, se crea automáticamente:

- **Email**: `admin@example.com`
- **Contraseña**: `admin123`
- **Rol**: `admin` (con todos los permisos)

> ⚠️ **Importante**: Cambia estas credenciales en producción

## 🧪 Testing

Este proyecto utiliza **Vitest** como framework de testing principal:

```bash
# Ejecutar todos los tests
pnpm run test

# Tests en modo watch
pnpm run test:unit --watch
pnpm run test:e2e --watch

# Generar reporte de cobertura
pnpm run test
```

### Estructura de Tests

- **Tests Unitarios**: Prueban componentes individuales
- **Tests E2E**: Prueban flujos completos de la aplicación
- **Cobertura Global**: Combina métricas de ambos tipos de tests

## 🔐 Sistema de Autenticación y RBAC

### Uso de Guards y Decoradores

#### Protección con JWT

```typescript
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  // Todos los endpoints requieren autenticación
}
```

#### Control de Acceso por Roles

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  // Solo usuarios con rol 'admin' pueden acceder
}
```

#### Control de Acceso por Permisos

```typescript
@Post()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('users:create')
createUser(@Body() createUserDto: CreateUserDto) {
  // Solo usuarios con permiso 'users:create'
}
```

#### Obtener Usuario Actual

```typescript
@Get('profile')
@UseGuards(JwtAuthGuard)
getProfile(@CurrentUser() user: User) {
  return user;
}
```

### Flujo de Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión
2. **Token JWT**: Se genera un token JWT con información del usuario, roles y permisos
3. **Autorización**: Cada request incluye el token en el header `Authorization: Bearer <token>`
4. **Validación**: Los guards validan el token y verifican permisos/roles
5. **Acceso**: Se permite o deniega el acceso según las reglas definidas

### Estructura del Token JWT

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "roles": ["admin", "user"],
  "permissions": ["users:create", "users:read", "roles:manage"],
  "iat": 1640995200,
  "exp": 1641081600
}
```

### Personalización del Sistema RBAC

#### Crear Nuevos Permisos

```typescript
// En auth.constants.ts
export const CUSTOM_PERMISSIONS = {
  POSTS_CREATE: 'posts:create',
  POSTS_PUBLISH: 'posts:publish',
};
```

#### Asignar Permisos a Roles

```typescript
// Programáticamente
await this.roleUseCase.assignPermission(roleId, {
  permissionId: 'permission-uuid'
});

// O via API
POST /roles/:id/assign-permission
{
  "permissionId": "permission-uuid"
}
```

#### Crear Roles Personalizados

```typescript
// Via API
POST /roles
{
  "name": "moderator",
  "description": "Usuario moderador con permisos limitados"
}
```

## 📖 Documentación

### Swagger/OpenAPI

La documentación de la API está disponible en:

- **Desarrollo**: `http://localhost:3001/api`
- **JSON Schema**: `http://localhost:3001/api-json`

### Compodoc

Genera documentación del código TypeScript:

```bash
pnpm run docss
```

## 🚀 Crear un Nuevo Repositorio desde este Template

### Opción 1: GitHub Template

1. Ve al [repositorio original](https://github.com/Enrique2115/api-nestjs-boilerplate-rest)
2. Haz clic en "Use this template"
3. Selecciona "Create a new repository"
4. Configura tu nuevo repositorio

### Opción 2: Usar la Rama Template

Este proyecto incluye una rama especial `template/authentication-rbac` que contiene:

- Sistema completo de autenticación JWT
- Control de acceso basado en roles (RBAC)
- Gestión de usuarios, roles y permisos
- Guards y decoradores personalizados
- Inicialización automática de datos

```bash
# Clonar el repositorio
git clone https://github.com/Enrique2115/api-nestjs-boilerplate-rest.git
cd api-nestjs-boilerplate-rest

# Cambiar a la rama template
git checkout template/authentication-rbac

# Crear tu propia rama
git checkout -b main
```

## 🔄 Workflow de Desarrollo

### Commits Convencionales

Este proyecto utiliza [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltante, etc.
refactor: refactorización de código
test: agregar tests
chore: tareas de mantenimiento
```

### Git Hooks

- **pre-commit**: Ejecuta linting y formateo
- **commit-msg**: Valida formato de mensaje de commit
- **pre-push**: Ejecuta tests antes del push

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'feat: add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Luis E. Morocho Febres**

- GitHub: [@Enrique2115](https://github.com/Enrique2115)
- Email: lmorochofebres@gmail.com

## 🙏 Agradecimientos

- [NestJS](https://nestjs.com/) - El framework que hace posible este boilerplate
- [Fastify](https://www.fastify.io/) - Por el rendimiento excepcional
- [Vitest](https://vitest.dev/) - Por hacer el testing más rápido y sencillo
- [AlbertHernandez](https://github.com/AlbertHernandez) - Por el template original

---

<p align="center">
  ⭐ ¡No olvides dar una estrella si este proyecto te fue útil!
</p>
