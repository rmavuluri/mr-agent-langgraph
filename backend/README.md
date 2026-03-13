# mr-agent Backend

REST API with Node, Express, and TypeScript. Uses raw SQL with the `pg` driver for PostgreSQL.

## Setup

1. **Install dependencies**

   ```bash
   cd backend && npm install
   ```

2. **PostgreSQL**

   Create a database (e.g. `mr_agent`) and set:

   ```bash
   cp .env.example .env
   # Edit .env and set DATABASE_URL, e.g.:
   # DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mr_agent?schema=public"
   ```

3. **Database schema**

   Either run the SQL file:

   ```bash
   psql -U postgres -d mr_agent -f sql/schema.sql
   ```

   Or use the init script (builds first, then runs the schema):

   ```bash
   npm run db:init
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:3001` (or `PORT` from `.env`).

## API

- **POST /api/auth/signup**  
  Body: `{ "email", "password", "confirmPassword", "dateOfBirth" }` (dateOfBirth: `YYYY-MM-DD`).  
  Creates a user and returns `{ user, message }`.  
  Validation: email format, password 8+ chars with one capital, one number, no spaces; passwords must match.

## Scripts

- `npm run dev` – development with hot reload
- `npm run build` – compile TypeScript to `dist/`
- `npm run start` – run `dist/index.js`
- `npm run db:init` – build and run schema (creates `users` table if not exists)
