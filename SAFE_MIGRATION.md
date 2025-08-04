# Safe Migration Strategy for Supabase

## The Problem
The `drizzle-kit push` command wants to make destructive changes because there's a mismatch between your local schema and what's in Supabase. Your Supabase database already has data that doesn't match the expected schema.

## Safe Migration Options

### Option 1: Pull Schema from Supabase First (RECOMMENDED)
This syncs your local schema with what's actually in Supabase:

```bash
# Pull the current schema from Supabase
npx drizzle-kit introspect --config drizzle.config.ts

# This will generate a schema file based on your actual database
# Review the generated schema and merge it with your local schema
```

### Option 2: Generate Migration Files for Review
Instead of pushing directly, generate SQL files you can review:

```bash
# Generate migration SQL files
npx drizzle-kit generate --config drizzle.config.ts

# This creates files in ./migrations folder
# Review them before applying
```

### Option 3: Manual Schema Sync
1. Export your current Supabase schema
2. Compare with your local schema
3. Manually update either side to match

## Steps for Safe Migration

### 1. Backup Your Data First
```sql
-- In Supabase SQL editor, create backup tables
CREATE TABLE sandwich_collections_backup_safe AS SELECT * FROM sandwich_collections;
CREATE TABLE messages_backup_safe AS SELECT * FROM messages;
-- Repeat for other important tables
```

### 2. Pull Current Schema
```bash
npx drizzle-kit introspect --config drizzle.config.ts --out ./supabase-schema
```

### 3. Review Differences
Compare the generated schema with your local `shared/schema.ts` file

### 4. Decide on Approach
- **If Supabase has the correct data**: Update your local schema to match
- **If local schema is correct**: Create careful migrations
- **If both have valuable parts**: Merge carefully

## Why This Happened

Your Supabase database appears to have:
1. **Old backup tables** (sandwich_collections_backup, etc.) from previous migrations
2. **Different column types** than expected
3. **Extra columns** that your local schema doesn't know about
4. **Missing some new columns** your app expects

## Quick Fix for Now

If you just want to get running without losing data:

```bash
# 1. Create a new schema file from Supabase
npx drizzle-kit introspect --config drizzle.config.ts --out ./temp-schema

# 2. Review the generated schema in ./temp-schema folder

# 3. Manually update your shared/schema.ts to match what's actually in Supabase

# 4. Your app should then work with the existing database
```

## Clean Up Later

Once running, you can:
1. Drop backup tables you don't need
2. Standardize column types
3. Add missing columns gradually
4. Remove deprecated columns

## Important Notes

- **NEVER** run push with "Yes, I want to remove X tables" unless you're absolutely sure
- Always backup before schema changes
- Consider using Supabase's built-in backup features
- Test migrations on a development database first