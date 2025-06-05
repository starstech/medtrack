# 🏠 Local Development Setup - Complete Beginner's Guide

This guide will help you set up everything on your own computer so you can test your app before putting it online. Don't worry - we'll go step by step!

## 🎯 What We're Doing

Think of this like setting up a mini version of your website on your own computer. This lets you:
- Test everything safely before going live
- Make changes without breaking anything
- Work without an internet connection
- Test the measurement preferences system locally
- Verify API integrations with mock data

## 📋 Step 1: Check What You Have

First, let's check if you have the right tools installed on your computer.

### Open Your Terminal (Command Line)

**On Mac:** Press `Cmd + Space`, type "Terminal", press Enter
**On Windows:** Press `Windows + R`, type "cmd", press Enter

### Check Node.js
Copy and paste this command, then press Enter:
```bash
node --version
```

**✅ Good:** You see something like `v18.17.0` or `v20.11.0`
**❌ Need to install:** Download from [nodejs.org](https://nodejs.org) (choose the LTS version)

### Check pnpm (Preferred Package Manager)
Copy and paste this command, then press Enter:
```bash
pnpm --version
```

**✅ Good:** You see something like `8.15.0`
**❌ Need to install:** Run this command:
```bash
npm install -g pnpm
```

### Check Docker
Copy and paste this command, then press Enter:
```bash
docker --version
```

**✅ Good:** You see something like `Docker version 24.0.0`
**❌ Need to install:** Download from [docker.com](https://docker.com/get-started)

### Check Supabase CLI
Copy and paste this command, then press Enter:
```bash
supabase --version
```

**✅ Good:** You see something like `1.123.4`
**❌ Need to install:** Run this command:
```bash
npm install -g supabase
```

## 📂 Step 2: Navigate to Your Project

In your terminal, you need to go to your project folder. You already did this, but here's how:

```bash
cd "/Users/yasser/Cursor Projects/medtrack"
```

**💡 Tip:** You can drag your project folder into Terminal to get the path automatically!

## 🗂️ Step 3: Set Up Your Database Files

Since you already ran `supabase init`, you now have a `supabase` folder. We need to populate the migration files with your database schema.

### **⚠️ IMPORTANT: Your migration files are currently empty!**

The migration files exist but are empty. We need to copy the SQL content into them.

**Option 1: Use the automated setup script (Recommended)**
```bash
./setup-migrations.sh
```

**Option 2: Copy files manually**
```bash
# Copy the schema files to migrations (run these commands one by one)
cp database/schemas/01_initial_schema.sql supabase/migrations/20250605123912_01_initial_schema.sql
cp database/schemas/12_measurement_preferences.sql supabase/migrations/20250605123956_12_measurement_preferences.sql
cp database/policies/02_rls_policies.sql supabase/migrations/20250605123956_02_rls_policies.sql
cp database/storage/04_storage_setup.sql supabase/migrations/20250605124009_03_storage_setup.sql
cp database/functions/05_database_functions.sql supabase/migrations/20250605124018_04_database_functions.sql
cp database/triggers/06_notification_triggers.sql supabase/migrations/20250605124028_05_notification_triggers.sql
cp database/realtime/07_realtime_setup.sql supabase/migrations/20250605124036_06_realtime_setup.sql
cp database/edge-functions/08_edge_functions.sql supabase/migrations/20250605124044_07_edge_functions.sql
cp database/validation/09_data_validation.sql supabase/migrations/20250605124052_08_data_validation.sql
cp database/compliance/10_compliance_logging.sql supabase/migrations/20250605124101_09_compliance_logging.sql
cp database/performance/11_performance_optimizations.sql supabase/migrations/20250605124111_10_performance_optimizations.sql
```

### Add Sample Data (Recommended for Testing)

```bash
cp database/seeds/03_sample_data.sql supabase/seed.sql
```

## 🚀 Step 4: Start Your Local Database

This is the exciting part! Run this command:

```bash
supabase start
```

**What you'll see:**
- Lots of text scrolling by (this is normal!)
- Docker downloading and setting up databases
- Eventually, a summary showing URLs and keys

**This takes 2-5 minutes the first time.** Get a coffee! ☕

**When it's done, you'll see something like:**
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**🎉 Success!** Your local database is now running!

## 🔧 Step 5: Connect Your App

**⚠️ CRITICAL FIX NEEDED:** Your app uses different environment variable names than standard Vite apps.

### Create Environment File

1. In your project root (same level as `package.json`), create a new file called `.env.local`
2. Copy this content into the file:

```env
# Local Supabase Configuration (NOTE: Using REACT_APP_ prefix to match your app)
REACT_APP_SUPABASE_URL=http://localhost:54321
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-from-step-4

# Alternative Vite format (for future migrations)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key-from-step-4

# Service role key for admin operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-step-4

# Local development flags
NODE_ENV=development
VITE_ENVIRONMENT=local

# API Configuration
VITE_API_BASE_URL=http://localhost:54321/rest/v1
VITE_ENABLE_MOCK_DATA=true
```

3. Replace `your-anon-key-from-step-4` with the actual anon key from step 4
4. Replace `your-service-role-key-from-step-4` with the actual service role key from step 4
5. Save the file

**💡 Important:** Never share these keys or put them on GitHub!

## 🌐 Step 6: View Your Database

Open your web browser and go to: `http://localhost:54323`

**What you'll see:**
- A beautiful dashboard (Supabase Studio)
- All your database tables
- Sample data (if you added it)
- Tools to view and edit data

**Cool things to explore:**
- Click "Table Editor" to see your data
- Click "SQL Editor" to run database commands
- Click "Storage" to see file uploads

## 📦 Step 6.5: Add Helpful Scripts (Optional but Recommended)

Add these scripts to your `package.json` for easier database management:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:reset": "supabase db reset",
    "db:status": "supabase status",
    "db:studio": "supabase studio"
  }
}
```

## 💻 Step 7: Install Dependencies and Run Your App

First, install all the required packages:

```bash
pnpm install
```

In a NEW terminal window (keep the database running), navigate to your project and start your app:

```bash
cd "/Users/yasser/Cursor Projects/medtrack"
```
```bash
pnpm dev
```

**What you'll see:**
- Your app starting up
- A message like "Local: http://localhost:3000"
- Your browser opening to your app

**🎉 You're done!** Your app is now running with a local database!

## 🧪 Step 8: Test Everything

1. **Register a new account** in your app
2. **Check the email verification** flow
3. **Add a patient** and see it appear in the database
4. **Test measurement preferences:**
   - Go to Profile → Measurement Settings
   - Try different medical scenario presets
   - Customize individual measurements
   - Test measurement entry modals
5. **Verify API integration:**
   - Check network tab for API calls
   - Confirm measurement preferences are saved
   - Test real-time preference updates
6. **Go to Supabase Studio** (`http://localhost:54323`) and see your data

## 🛠️ Daily Development Workflow

### Starting Work
```bash
# Option 1: Using Supabase CLI directly
supabase start

# Option 2: Using the npm scripts (if you added them)
pnpm run db:start

# Start your app (in a new terminal)
pnpm dev
```

### Stopping Work
```bash
# Stop your app (Ctrl+C in the terminal running pnpm dev)

# Option 1: Stop the database directly
supabase stop

# Option 2: Using npm scripts
pnpm run db:stop
```

### Making Database Changes
```bash
# Create a new migration file
supabase migration new my_new_feature

# Edit the file, then apply changes
supabase db reset
# OR
pnpm run db:reset

# Check database status
pnpm run db:status

# Open database studio
pnpm run db:studio
```

## 🆘 When Things Go Wrong

### "Port already in use"
Someone else is using port 54321. Run:
```bash
supabase stop
supabase start
```

### "Docker not running"
Start Docker Desktop on your computer, then try again.

### "Permission denied"
On Mac/Linux, try adding `sudo` before the command:
```bash
sudo supabase start
```

### "Can't connect to database"
1. Check if Docker is running
2. Run `supabase stop` then `supabase start`
3. Wait a full 2-3 minutes for everything to start

### App shows errors
1. **Environment Variable Issues:**
   - Check your `.env.local` file has the right keys
   - **CRITICAL:** Use `REACT_APP_` prefix (not `VITE_`) for this app
   - Restart your app after changing environment variables
2. Make sure both the database AND app are running
3. Try refreshing your browser
4. Check browser console for specific error messages
5. Verify measurement preferences service is working

### "Supabase client not configured" error
1. Check that your `.env.local` file exists in the project root
2. Verify you're using `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
3. Restart your development server (`pnpm dev`)
4. Check the browser console for the actual environment variable values

### Migration files are empty
If you see "relation does not exist" errors:
1. Check that migration files in `supabase/migrations/` have content
2. Run the copy commands from Step 3 again
3. Reset the database: `supabase db reset`

## 🎓 What You've Learned

- ✅ Set up a local development environment
- ✅ Connected your app to a local database
- ✅ Used professional development tools
- ✅ Can test changes safely before going live
- ✅ Configured measurement preferences system
- ✅ Set up REST API integration with mock data
- ✅ Tested self-contained modal architecture

## 🚀 Next Steps

When you're ready to put your app online:
1. Follow the [Production Setup Guide](PRODUCTION_SETUP.md)
2. Deploy your app to Vercel/Netlify
3. Use the online Supabase database

**Congratulations! You're now a local development pro!** 🎉

---

**Need help?** 
- Check the troubleshooting section above
- Ask in the Supabase Discord
- Email support@medtrack.com 