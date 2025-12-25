# Database Schema Update Guide

This guide explains how to update your Neon database after making schema changes with Drizzle ORM.

## Quick Reference

```bash
# After updating schema files in db/schema/
pnpm db:push              # Push changes directly (development)
# OR
pnpm db:generate          # Generate migration files
pnpm db:migrate           # Apply migrations (production)
```

---

## Available Database Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `pnpm db:push` | Push schema directly to database | Development - quick iterations |
| `pnpm db:generate` | Generate SQL migration files | Production - version control migrations |
| `pnpm db:migrate` | Apply pending migrations | Production - deploy changes |
| `pnpm db:studio` | Open Drizzle Studio GUI | Browse/edit data visually |
| `pnpm db:seed` | Seed database with sample data | Initial setup or testing |
| `pnpm db:reset` | Drop all tables and enums | Clean slate (keeps schema) |
| `pnpm db:reset:full` | Nuke entire database | Complete fresh start |

---

## Two Approaches to Schema Updates

### Option 1: Quick Push (Development) ⚡

**Use this when:**
- You're actively developing
- Making frequent schema changes
- Working locally
- Don't need migration history

**Steps:**
```bash
# 1. Edit your schema file
vim db/schema/tournaments.ts

# 2. Push changes directly
pnpm db:push

# 3. Confirm when prompted
# Select: "Yes, I want to execute all statements"
```

**Pros:**
- ✅ Fast and simple
- ✅ No migration files to manage
- ✅ Perfect for iteration

**Cons:**
- ❌ No migration history
- ❌ Can't rollback
- ❌ Not suitable for production

---

### Option 2: Generate Migrations (Production) 📦

**Use this when:**
- Preparing for production
- Want migration history
- Need to review SQL changes
- Working with team

**Steps:**
```bash
# 1. Edit your schema file
vim db/schema/tournaments.ts

# 2. Generate migration
pnpm db:generate

# 3. Review the generated SQL
cat db/migrations/0001_*.sql

# 4. Apply migration
pnpm db:migrate

# 5. Commit migration files to git
git add db/migrations/
git commit -m "Add city field to tournaments"
```

**Pros:**
- ✅ Version controlled
- ✅ Can review SQL before applying
- ✅ Safe for production
- ✅ Can rollback if needed

**Cons:**
- ❌ Slightly more steps
- ❌ Need to commit migration files

---

## Common Scenarios

### Scenario 1: Adding a New Column

**Schema Change:**
```typescript
// db/schema/tournaments.ts
export const tournaments = pgTable('tournaments', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 255 }),  // ← NEW COLUMN
  // ... rest of fields
});
```

**Update Database:**
```bash
pnpm db:push
```

**What happens:**
- Drizzle adds the `city` column to existing `tournaments` table
- Existing rows will have `NULL` for this column
- No data loss

---

### Scenario 2: Changing Column Type

**Schema Change:**
```typescript
// Before
graduationYear: integer('graduation_year')

// After
graduationYear: varchar('graduation_year', { length: 4 })
```

**Update Database:**
```bash
pnpm db:push
```

**⚠️ Warning:**
- May require data migration
- Drizzle will attempt to cast values
- Review the SQL Drizzle generates before confirming

---

### Scenario 3: Adding a New Table

**Schema Change:**
```typescript
// db/schema/messages.ts
export const messages = pgTable('messages', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

**Don't forget to export it:**
```typescript
// db/schema/index.ts
export * from './messages';  // ← ADD THIS
```

**Update Database:**
```bash
pnpm db:push
```

---

### Scenario 4: Database is Out of Sync

**Problem:** You made changes but can't remember what you did.

**Solution:**
```bash
# Option 1: Let Drizzle figure it out
pnpm db:push
# Drizzle will show you all changes and ask for confirmation

# Option 2: Start fresh (⚠️ deletes all data)
pnpm db:reset:full
pnpm db:push
pnpm db:seed  # Re-add sample data
```

---

### Scenario 5: Migration Failed Mid-Way

**Problem:** Migration crashed and database is in unknown state.

**Solution:**
```bash
# 1. Check what's in the database
pnpm db:studio

# 2. If tables are partially created, reset
pnpm db:reset:full

# 3. Fix your schema, then push again
pnpm db:push
```

---

## Best Practices

### For Development (Local)
1. ✅ Use `pnpm db:push` for quick iterations
2. ✅ Use `pnpm db:studio` to inspect data
3. ✅ Use `pnpm db:reset:full` when things get messy
4. ✅ Keep `.env.local` file safe (don't commit it)

### For Production (Deployment)
1. ✅ Always use `pnpm db:generate` + `pnpm db:migrate`
2. ✅ Review migration SQL before applying
3. ✅ Commit migration files to version control
4. ✅ Test migrations on staging first
5. ✅ Backup database before major changes

### Always
1. ✅ Never delete ID columns
2. ✅ Be careful with `NOT NULL` on existing tables
3. ✅ Test with sample data before production
4. ✅ Document breaking schema changes

---

## Troubleshooting

### "Failed query: ALTER TABLE..."
**Cause:** Database and schema are out of sync.

**Fix:**
```bash
# See what Drizzle wants to do
pnpm db:push
# Review the changes, then confirm or fix schema
```

### "Column already exists"
**Cause:** You pushed the same change twice.

**Fix:**
```bash
# Just continue - it's already there
# Or reset if you want a clean slate:
pnpm db:reset:full && pnpm db:push
```

### "Cannot drop column: used in foreign key"
**Cause:** Column is referenced by another table.

**Fix:**
1. Drop the foreign key constraint first
2. Then drop the column
3. Or use `pnpm db:reset:full` and recreate

### "Neon connection error"
**Cause:** Database URL is wrong or database doesn't exist.

**Fix:**
```bash
# Check your .env.local file has correct values:
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...
```

---

## Schema File Locations

```
db/
├── schema/
│   ├── index.ts          # Exports all schemas
│   ├── enums.ts          # Shared enum types
│   ├── users.ts          # Users table
│   ├── players.ts        # Players table
│   ├── coaches.ts        # Coaches table
│   ├── tournaments.ts    # Tournaments table ← You're here
│   ├── colleges.ts       # Colleges table
│   └── ...               # Other tables
├── migrations/           # Auto-generated SQL files
│   ├── 0000_*.sql
│   └── 0001_*.sql
├── index.ts             # Database connection
├── migrate.ts           # Migration runner
├── seed.ts              # Sample data seeder
├── reset.ts             # Table dropper
└── reset-full.ts        # Full database nuker
```

---

## Example Workflow

Let's say you want to add a `city` field to tournaments:

```bash
# 1. Edit the schema
vim db/schema/tournaments.ts
# Add: city: varchar('city', { length: 255 })

# 2. Push to database
pnpm db:push

# 3. You'll see:
#    + city column will be created
#    ❯ No, abort
#      Yes, I want to execute all statements

# 4. Select "Yes" (or press Enter if it's already selected)

# 5. Done! The city column is now in your database

# 6. Test it
pnpm db:studio
# Browse to tournaments table and verify city column exists
```

That's it! Your database is updated and ready to use.

---

## Quick Tips

💡 **Use `db:studio` to debug** - It's a visual database browser
💡 **Use `db:seed` after reset** - Adds sample data for testing
💡 **Use `db:push` in development** - Fast and simple
💡 **Use `db:generate` for production** - Safe and trackable
💡 **Always backup before big changes** - Neon has point-in-time recovery

---

## Need Help?

1. Check this guide
2. Look at existing schema files in `db/schema/`
3. Run `pnpm db:studio` to see current state
4. Check Drizzle docs: https://orm.drizzle.team/docs/overview
