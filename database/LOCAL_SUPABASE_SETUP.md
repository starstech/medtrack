# Local Supabase Setup Guide for MedTrack

This guide will help you set up a local Supabase instance for testing the MedTrack application before deploying to production.

## 📋 Prerequisites

### 1. System Requirements
- **Node.js**: v18 or higher
- **Docker**: Latest version
- **Docker Compose**: v2.0 or higher
- **Git**: Latest version
- **pnpm**: Latest version (as per your preference)

### 2. Install Required Tools

#### Install Supabase CLI
```bash
# Using npm
npm install -g supabase

# Using Homebrew (macOS)
brew install supabase/tap/supabase

# Using Scoop (Windows)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

#### Verify Installation
```bash
supabase --version
docker --version
docker-compose --version
```

## 🚀 Setup Process

### Step 1: Initialize Supabase Project

```bash
# Navigate to your project directory
cd /Users/yasser/Cursor%20Projects/medtrack

# Initialize Supabase (this creates supabase/ folder)
supabase init

# This creates:
# supabase/
# ├── config.toml
# ├── seed.sql
# └── migrations/
```

### Step 2: Configure Supabase

Edit `supabase/config.toml`:

```toml
# A string used to distinguish different Supabase projects on the same host
project_id = "medtrack-local"

[api]
enabled = true
# Port to use for the API URL.
port = 54321
# Schemas to expose in your API. Tables, views and stored procedures in this schema will get API endpoints.
# public and storage are always included.
schemas = ["public", "api", "storage", "graphql_public"]
# Extra schemas to add to the search_path of every request. public is always included.
extra_search_path = ["public", "extensions"]
# The maximum number of rows returns from a view, table, or stored procedure. Limits payload size for accidental or malicious requests.
max_rows = 1000

[db]
# Port to use for the local database URL.
port = 54322
# Port used by db diff command to initialize the shadow database.
shadow_port = 54320
# The database major version to use. This has to be the same as your remote database's. Run `SHOW server_version;` on the remote database to check.
major_version = 15

[studio]
enabled = true
# Port to use for Supabase Studio.
port = 54323
# External URL of the API server that frontend connects to.
api_url = "http://localhost:54321"

[inbucket]
enabled = true
# Port to use for the email testing server web interface.
port = 54324
# Uncomment to expose additional ports for testing user applications that send emails.
# smtp_port = 54325
# pop3_port = 54326

[storage]
enabled = true
# The maximum file size allowed (e.g. "5MB", "500KB").
file_size_limit = "50MiB"

[auth]
enabled = true
# The base URL of your website. Used as an allow-list for redirects and for constructing URLs used
# in emails.
site_url = "http://localhost:3000"
# A list of *exact* URLs that auth providers are permitted to redirect to post authentication.
additional_redirect_urls = ["http://localhost:3000"]
# How long tokens are valid for, in seconds. Defaults to 3600 (1 hour), maximum 604800 (1 week).
jwt_expiry = 3600
# If disabled, the refresh token will never expire.
enable_refresh_token_rotation = true
# Allows refresh tokens to be reused after expiry, up to the specified interval in seconds.
# Requires enable_refresh_token_rotation = true.
refresh_token_reuse_interval = 10
# Allow/disallow new user signups to your project.
enable_signup = true

[auth.email]
# Allow/disallow new user signups via email to your project.
enable_signup = true
# If enabled, a user will be required to confirm any email change on both the old, and new email addresses. If disabled, only the new email is required to confirm.
double_confirm_change = true
# If enabled, users need to confirm their email address before signing in.
enable_confirmations = false

# Use an external SMTP server
[auth.email.smtp]
enabled = false
host = "localhost"
port = 587
user = ""
pass = ""
admin_email = ""
sender_name = ""

[auth.sms]
enabled = false

[analytics]
enabled = false
```

### Step 3: Create Migration Files

Instead of running SQL directly, we'll create migration files:

```bash
# Create initial migration
supabase migration new initial_setup

# This creates: supabase/migrations/YYYYMMDDHHMMSS_initial_setup.sql
```

### Step 4: Prepare Migration Files

Copy our database files into migrations:

```bash
# Create the migration files in order
supabase migration new 01_initial_schema
supabase migration new 02_rls_policies  
supabase migration new 03_storage_setup
supabase migration new 04_database_functions
supabase migration new 05_notification_triggers
supabase migration new 06_realtime_setup
supabase migration new 07_edge_functions
supabase migration new 08_data_validation
supabase migration new 09_compliance_logging
supabase migration new 10_performance_optimizations
```

Then copy the content from our database files:

```bash
# Copy content from database/schemas/01_initial_schema.sql 
# to supabase/migrations/YYYYMMDDHHMMSS_01_initial_schema.sql

# Copy content from database/policies/02_rls_policies.sql
# to supabase/migrations/YYYYMMDDHHMMSS_02_rls_policies.sql

# And so on for all files...
```

### Step 5: Create Seed Data

Edit `supabase/seed.sql` and add our sample data:

```sql
-- Copy content from database/seeds/03_sample_data.sql
-- Remember to replace 'user-uuid-here' with actual UUIDs
```

### Step 6: Start Local Supabase

```bash
# Start all services
supabase start

# This will:
# - Start PostgreSQL database
# - Start PostgREST API
# - Start Supabase Studio
# - Start Auth server
# - Start Storage server
# - Apply all migrations
# - Run seed data
```

You should see output like:
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: your-jwt-secret
        anon key: your-anon-key
service_role key: your-service-role-key
```

### Step 7: Update Environment Variables

Create/update `.env.local` in your Next.js project:

```env
# Local Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-from-output
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-output

# Database URL for direct connection (if needed)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Local development flag
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=local
```

## 🧪 Testing Your Setup

### 1. Verify Database Connection

```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:54322/postgres

# Check our schema
\dn
\dt api.*
```

### 2. Test Studio Access

Open http://localhost:54323 in your browser to access Supabase Studio.

### 3. Test API Endpoints

```bash
# Test API connection
curl http://localhost:54321/rest/v1/api/profiles \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### 4. Run Your Next.js App

```bash
# In your project directory
pnpm dev

# Your app should now connect to local Supabase
```

## 📝 Development Workflow

### Making Database Changes

```bash
# Create a new migration
supabase migration new add_new_feature

# Edit the migration file
# supabase/migrations/YYYYMMDDHHMMSS_add_new_feature.sql

# Apply migration
supabase db reset

# Or apply just new migrations
supabase migration up
```

### Viewing Logs

```bash
# View all service logs
supabase logs

# View specific service logs
supabase logs --db
supabase logs --api
supabase logs --auth
```

### Database Management

```bash
# Reset database (reapplies all migrations + seed)
supabase db reset

# Create a dump of current state
supabase db dump --data-only > backup.sql

# Stop services
supabase stop

# Start with fresh data
supabase start --ignore-health-check
```

## 🔄 Syncing with Production

### Generate Types (Optional)

```bash
# Generate TypeScript types from your schema
supabase gen types typescript --local > src/types/supabase.ts
```

### Backup/Restore

```bash
# Backup local database
supabase db dump > local_backup.sql

# Restore from backup
supabase db reset
psql -f local_backup.sql postgresql://postgres:postgres@localhost:54322/postgres
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using ports
lsof -i :54321
lsof -i :54322
lsof -i :54323

# Kill processes if needed
kill -9 PID
```

#### 2. Docker Issues
```bash
# Clean up Docker
docker system prune -a

# Restart Docker
# On macOS: Restart Docker Desktop
# On Linux: sudo systemctl restart docker
```

#### 3. Migration Errors
```bash
# Check migration status
supabase migration list

# Reset and try again
supabase db reset

# Check specific migration
supabase migration show YYYYMMDDHHMMSS_migration_name
```

#### 4. Storage Issues
```bash
# Clear storage data
supabase stop
docker volume rm supabase_storage_data
supabase start
```

### Useful Commands

```bash
# Check service status
supabase status

# View configuration
supabase config

# Update CLI
supabase update

# Get help
supabase help
supabase help db
```

## 📊 Monitoring Local Development

### Studio Features to Use

1. **Table Editor**: View and edit data
2. **SQL Editor**: Run custom queries
3. **Database**: Monitor schema and relationships
4. **Storage**: Manage file uploads
5. **Logs**: View real-time logs

### Performance Testing

```sql
-- Test query performance
EXPLAIN ANALYZE SELECT * FROM api.patients 
JOIN api.patient_caregivers ON patients.id = patient_caregivers.patient_id;

-- Check index usage
SELECT * FROM api.performance_stats;

-- Monitor materialized views
SELECT * FROM api.medication_adherence_stats;
```

## 🚀 Moving to Production

### 1. Export Local Schema

```bash
# Generate migration file from current state
supabase db diff --file new_migration.sql

# Or generate complete schema
supabase db dump --schema-only > production_schema.sql
```

### 2. Test Migration Path

```bash
# Test migration on clean database
supabase db reset
# Apply migrations one by one to verify
```

### 3. Environment Transition

When ready for production:

1. Update `.env.local` to `.env.production`
2. Replace local URLs with production Supabase URLs
3. Deploy your Next.js app
4. Run migrations on production database

## ⚠️ Important Notes

### Security
- **Never commit** `.env` files with real keys
- **Use different databases** for development/testing/production
- **Rotate keys** between environments

### Data Management
- **Regular backups** of local development data
- **Separate user accounts** for testing
- **Clean up test data** regularly

### Performance
- **Monitor query performance** locally first
- **Test with realistic data volumes**
- **Verify indexes** are working correctly

This setup gives you a complete local development environment that mirrors your production Supabase setup, allowing for thorough testing before deployment! 🎉 