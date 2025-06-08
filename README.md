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

### 🔒 Seguridad
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
   
   # CLOUDINARY (opcional)
   API_NAME=tu_api_name
   API_KEY=tu_api_key
   API_SECRET=tu_api_secret
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
# Levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
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
└── core/                 # Módulos core
    ├── health/          # Health checks
    ├── infra/           # Infraestructura
    └── redis/           # Configuración Redis

tests/
├── e2e/                 # Tests end-to-end
├── unit/                # Tests unitarios
└── utils/               # Utilidades de testing
```

## 🌐 API Endpoints

### Health Check
- `GET /health` - Estado de la aplicación
- `GET /health/database` - Estado de la base de datos
- `GET /health/redis` - Estado de Redis

### Documentación
- `GET /api` - Swagger UI (solo en desarrollo)
- `GET /api-json` - Especificación OpenAPI JSON

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `APP_NAME` | Nombre de la aplicación | `API-NestJS-Boilerplate` |
| `NODE_ENV` | Entorno de ejecución | `development` |
| `HOST` | Host del servidor | `0.0.0.0` |
| `PORT` | Puerto del servidor | `3001` |
| `API_NAME` | Nombre API Cloudinary | - |
| `API_KEY` | Clave API Cloudinary | - |
| `API_SECRET` | Secret API Cloudinary | - |

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

### Opción 2: GitHub CLI

```bash
# Crear repositorio desde template
gh repo create mi-nueva-api --template Enrique2115/api-nestjs-boilerplate-rest

# Clonar y configurar
git clone https://github.com/tu-usuario/mi-nueva-api.git
cd mi-nueva-api
pnpm install
```

### Opción 3: Fork y Clone

```bash
# Fork del repositorio
gh repo fork Enrique2115/api-nestjs-boilerplate-rest --clone

# Renombrar y configurar
cd api-nestjs-boilerplate-rest
git remote rename origin upstream
git remote add origin https://github.com/tu-usuario/mi-nueva-api.git
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

---

<p align="center">
  ⭐ ¡No olvides dar una estrella si este proyecto te fue útil!
</p>