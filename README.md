# BioRehab — Sistema de Gestión de Sesiones de Rehabilitación Física

> **CI-0141 Bases de Datos Avanzadas** · Exposición NoSQL · Universidad de Costa Rica · I Ciclo 2026  
> Motor: **MongoDB 7** (Categoría: Documental)

Sistema de API REST para gestionar pacientes y sesiones de rehabilitación física, con registro de datos biomecánicos por ejercicio y análisis de recuperación mediante IA.

---

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20 |
| Framework | Express 4 |
| ODM | Mongoose 8 |
| Base de datos | MongoDB 7 |
| Contenedores | Docker + Docker Compose |

---

## Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y corriendo
- Node.js 20+

---

## Setup

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd nosql-mongodb-rehab

# 2. Crear archivo de variables de entorno
cp .env.example .env

# 3. Levantar contenedores en Docker
docker-compose up --build

# 4. (Opcional) Cargar datos de prueba
docker exec biorehab_api npm run seed
```

La API estará disponible en `http://localhost:3000`.

> **Nota:** El seed borra todos los datos existentes e inserta 10 pacientes y ~30 sesiones de ejemplo. Solo ejecutarlo una vez o cuando se quiera reiniciar la base de datos.

> Para correr todo con Docker (MongoDB + API): `docker-compose up -d`

---

## Setup local (sin Docker)

1. Instalar [MongoDB Community 7](https://www.mongodb.com/try/download/community).
2. En `.env`, usar `MONGO_URI_LOCAL` en lugar de `MONGO_URI`.

---

## Endpoints

### Pacientes `/api/pacientes`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/pacientes` | Crear paciente |
| `GET` | `/api/pacientes` | Listar todos (`?page&limit`) |
| `GET` | `/api/pacientes/:id` | Obtener por ID |
| `PUT` | `/api/pacientes/:id` | Actualizar paciente |
| `DELETE` | `/api/pacientes/:id` | Eliminar paciente |
| `GET` | `/api/pacientes/search` | Buscar (`?q&diagnostico&genero`) |
| `GET` | `/api/pacientes/:id/progreso` | Tendencia de recuperación (`?semanas`) |

### Sesiones `/api/sesiones`

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/sesiones` | Crear sesión |
| `GET` | `/api/sesiones` | Listar todas (`?page&limit&pacienteId`) |
| `GET` | `/api/sesiones/:id` | Obtener por ID |
| `PATCH` | `/api/sesiones/:id` | Actualización parcial |
| `DELETE` | `/api/sesiones/:id` | Eliminar sesión |
| `GET` | `/api/sesiones/search` | Filtrar (`?pacienteId&tipoSesion&fechaInicio&fechaFin&estado`) |

---

## Estructura del proyecto

```
nosql-mongodb-rehab/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
├── src/
│   ├── server.js
│   ├── app.js
│   ├── config/
│   │   └── database.js
│   ├── models/
│   │   ├── paciente.model.js
│   │   └── sesion.model.js
│   ├── controllers/
│   │   ├── paciente.controller.js
│   │   └── sesion.controller.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── paciente.routes.js
│   │   └── sesion.routes.js
│   └── middleware/
│       └── errorHandler.js
```

---

## Integrantes del grupo

| Nombre | Carné |
|--------|-------|
| Katherine Acosta Barquero | B70047 |
| Elizabeth Huang Wu | C23913 |
| Henoc Rojas Carrillo | C26764 |
| Christopher Zúñiga Rojas | C28730 |

**Profesor:** M.Sc. Sleyter Angulo Chavarria · **Ciclo:** I 2026
