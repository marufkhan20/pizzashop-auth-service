# Auth Service

Authentication and authorization microservice for the Pizza Shop project. It handles user registration/login, JWT access & refresh tokens (RS256, backed by a public/private key pair), role-based access control, and tenant (restaurant branch) management.

## Tech Stack

- **Runtime:** Node.js (v24) with TypeScript, run via `tsx`
- **Framework:** Express 5
- **Database:** PostgreSQL with TypeORM
- **Auth:** JWT (RS256) via `jsonwebtoken` / `express-jwt` / `jwks-rsa`, cookie-based tokens via `cookie-parser`
- **Dependency Injection:** InversifyJS
- **Validation:** express-validator
- **Testing:** Jest, Supertest, `mock-jwks`, MSW
- **Logging:** Winston

## Prerequisites

- Node.js `v24.15.0` (see `.nvmrc`)
- PostgreSQL instance
- npm

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and fill in the values:

   ```bash
   cp .env.example .env.dev
   ```

3. Generate the RSA key pair used to sign/verify JWTs:

   ```bash
   node scripts/generateKeys.js
   ```

   This creates `certs/private.pem` and `certs/public.pem`. To publish the public key as a JWKS (served from `public/.well-known/jwks.json`), run:

   ```bash
   node scripts/convertPemToJwk.js
   ```

4. Run database migrations:

   ```bash
   npm run migration:run
   ```

5. Start the dev server:

   ```bash
   npm run dev
   ```

The service starts on the port defined by `PORT` in your env file.

## Environment Variables

| Variable                | Description                                      |
| ------------------------ | ------------------------------------------------- |
| `PORT`                  | Port the HTTP server listens on                  |
| `DB_HOST`               | PostgreSQL host                                  |
| `DB_PORT`               | PostgreSQL port                                  |
| `DB_USERNAME`           | PostgreSQL username                              |
| `DB_PASSWORD`           | PostgreSQL password                              |
| `DB_NAME`               | PostgreSQL database name                         |
| `REFRESH_TOKEN_SECRET`  | Secret used to sign refresh tokens                |
| `JWKS_URI`              | URI where the JWKS (public keys) are served       |

## Available Scripts

| Script                     | Description                                   |
| --------------------------- | ---------------------------------------------- |
| `npm run dev`               | Run the server in watch mode                   |
| `npm run build`              | Compile TypeScript to `dist/`                  |
| `npm start`                  | Run the compiled/entry server                  |
| `npm test`                   | Run the Jest test suite with coverage          |
| `npm run test:watch`         | Run tests in watch mode                        |
| `npm run lint` / `lint:fix`  | Lint the codebase                              |
| `npm run format:check` / `format:fix` | Check/format code with Prettier      |
| `npm run migration:generate` | Generate a TypeORM migration from entity changes |
| `npm run migration:create`   | Create a new empty migration                   |
| `npm run migration:run`      | Run pending migrations                         |

## API Endpoints

### Auth (`/auth`)

| Method | Endpoint         | Description                              | Auth required |
| ------ | ---------------- | ----------------------------------------- | -------------- |
| POST   | `/auth/register` | Register a new user                       | No             |
| POST   | `/auth/login`    | Log in and receive access/refresh tokens  | No             |
| GET    | `/auth/self`     | Get the currently authenticated user      | Yes            |
| POST   | `/auth/refresh`  | Refresh the access token                  | Refresh token  |
| POST   | `/auth/logout`   | Log out and invalidate the refresh token  | Yes            |

### Users (`/users`) — Admin only

| Method | Endpoint     | Description        |
| ------ | ------------ | ------------------- |
| POST   | `/users`     | Create a user        |
| GET    | `/users`     | List users            |
| GET    | `/users/:id` | Get a user by ID     |
| PATCH  | `/users/:id` | Update a user         |
| DELETE | `/users/:id` | Delete a user         |

### Tenants (`/tenants`)

| Method | Endpoint       | Description                     | Auth required |
| ------ | -------------- | -------------------------------- | -------------- |
| POST   | `/tenants`     | Create a tenant                  | Admin          |
| GET    | `/tenants`     | List tenants                     | No             |
| GET    | `/tenants/:id` | Get a tenant by ID                | Admin          |
| PATCH  | `/tenants/:id` | Update a tenant                  | Admin          |
| DELETE | `/tenants/:id` | Delete a tenant                  | Admin          |

## Roles

Defined in `src/constants/index.ts`: `customer`, `admin`, `manager`.

## Docker

Development image:

```bash
docker build -f docker/dev/Dockerfile -t auth-service:dev .
```

Production image is defined in `docker/prod/Dockerfile`.

## Code Quality

- Husky + lint-staged run Prettier and ESLint on staged `.ts` files before each commit.
- SonarQube configuration is available in `sonar-project.properties`.
