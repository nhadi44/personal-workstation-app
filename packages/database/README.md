# Database (Prisma) Scripts

All commands can be run from workspace root using `pnpm <script>`.

| Script               | Description                                                               |
| -------------------- | ------------------------------------------------------------------------- |
| `db:prisma`          | Run Prisma CLI passthrough with project config (`-- --help` for options). |
| `db:generate`        | Generate Prisma Client from `prisma/schema.prisma`.                       |
| `db:format`          | Format Prisma schema files.                                               |
| `db:validate`        | Validate Prisma schema and config.                                        |
| `db:studio`          | Open Prisma Studio GUI for data browsing/editing.                         |
| `db:status`          | Show migration status and whether DB is up to date.                       |
| `db:migrate`         | Create/apply dev migration (same as `db:migrate:dev`).                    |
| `db:migrate:dev`     | Run `prisma migrate dev` in development.                                  |
| `db:migrate:create`  | Create migration only (no apply). Use with name.                          |
| `db:migrate:deploy`  | Apply existing migrations (production-safe command).                      |
| `db:migrate:reset`   | Reset database, reapply migrations, rerun seed.                           |
| `db:migrate:resolve` | Manually mark migration as applied/rolled-back.                           |
| `db:pull`            | Introspect database and update schema from DB.                            |
| `db:push`            | Push schema state directly to DB (no migration files).                    |
| `db:seed`            | Run configured Prisma seed script.                                        |

## Common usage

- Create migration file only:
  - `pnpm db:migrate:create -- --name init_users`
- Create + apply migration in dev:
  - `pnpm db:migrate:dev -- --name add_profiles`
- Check status:
  - `pnpm db:status`
- Open Studio:
  - `pnpm db:studio`

## Notes

- Prisma config is loaded from `packages/database/prisma/prisma.config.ts`.
- For migrate commands, config uses `DIRECT_URL` first (recommended for Supabase migrations).
- Keep `.env` at workspace root based on `.env.example`.
