#!/bin/bash

# Setup script for MedTrack Local Supabase Development
# This script copies database schema files to Supabase migration files

echo "🚀 Setting up MedTrack Local Supabase Development..."

# Check if supabase directory exists
if [ ! -d "supabase" ]; then
    echo "❌ Error: supabase directory not found. Please run 'supabase init' first."
    exit 1
fi

# Check if database directory exists
if [ ! -d "database" ]; then
    echo "❌ Error: database directory not found."
    exit 1
fi

echo "📂 Copying database schema files to migrations..."

# Copy schema files to migrations
cp database/schemas/01_initial_schema.sql supabase/migrations/20250605123912_01_initial_schema.sql
echo "✅ Copied initial schema"

cp database/schemas/12_measurement_preferences.sql supabase/migrations/20250605123956_12_measurement_preferences.sql
echo "✅ Copied measurement preferences schema"

cp database/policies/02_rls_policies.sql supabase/migrations/20250605123956_02_rls_policies.sql
echo "✅ Copied RLS policies"

cp database/storage/04_storage_setup.sql supabase/migrations/20250605124009_03_storage_setup.sql
echo "✅ Copied storage setup"

cp database/functions/05_database_functions.sql supabase/migrations/20250605124018_04_database_functions.sql
echo "✅ Copied database functions"

cp database/triggers/06_notification_triggers.sql supabase/migrations/20250605124028_05_notification_triggers.sql
echo "✅ Copied notification triggers"

cp database/realtime/07_realtime_setup.sql supabase/migrations/20250605124036_06_realtime_setup.sql
echo "✅ Copied realtime setup"

cp database/edge-functions/08_edge_functions.sql supabase/migrations/20250605124044_07_edge_functions.sql
echo "✅ Copied edge functions"

cp database/validation/09_data_validation.sql supabase/migrations/20250605124052_08_data_validation.sql
echo "✅ Copied data validation"

cp database/compliance/10_compliance_logging.sql supabase/migrations/20250605124101_09_compliance_logging.sql
echo "✅ Copied compliance logging"

cp database/performance/11_performance_optimizations.sql supabase/migrations/20250605124111_10_performance_optimizations.sql
echo "✅ Copied performance optimizations"

# Copy sample data
cp database/seeds/03_sample_data.sql supabase/seed.sql
echo "✅ Copied sample data"

echo ""
echo "🎉 Setup complete! Your migration files are now populated."
echo ""
echo "Next steps:"
echo "1. Run 'supabase start' to start the local database"
echo "2. Create a .env.local file with your Supabase keys"
echo "3. Run 'pnpm dev' to start your app"
echo ""
echo "For detailed instructions, see database/LOCAL_SUPABASE_SETUP.md" 