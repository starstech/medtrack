# Production Supabase Setup Guide for MedTrack

This guide covers setting up your production Supabase database for the MedTrack application.

## 📋 Prerequisites

### 1. Supabase Account & Project
- Active Supabase account at [supabase.com](https://supabase.com)
- New project created with appropriate region selection
- Project URL and API keys available

### 2. Production Environment
- Domain name configured
- SSL certificate (handled by deployment platform)
- Environment variables secured

## 🚀 Production Setup Process

### Step 1: Project Configuration

1. **Log into Supabase Dashboard**
   - Go to [app.supabase.com](https://app.supabase.com)
   - Create new project or select existing project

2. **Configure Project Settings**
   ```
   Project Name: MedTrack Production
   Database Password: [Generate strong password]
   Region: [Choose closest to your users]
   Plan: Pro (recommended for production)
   ```

3. **Enable Required Extensions**
   - Go to Database → Extensions
   - Enable: `uuid-ossp`, `pg_stat_statements`, `pg_cron`

### Step 2: Database Schema Setup

Execute the SQL files in this **exact order** using the SQL Editor:

1. **Schema & Tables**
   ```sql
   -- Copy and execute: database/schemas/01_initial_schema.sql
   ```

2. **Security Policies**
   ```sql
   -- Copy and execute: database/policies/02_rls_policies.sql
   ```

3. **Storage Setup**
   ```sql
   -- Copy and execute: database/storage/04_storage_setup.sql
   ```

4. **Database Functions**
   ```sql
   -- Copy and execute: database/functions/05_database_functions.sql
   ```

5. **Notification System**
   ```sql
   -- Copy and execute: database/triggers/06_notification_triggers.sql
   ```

6. **Real-time Features**
   ```sql
   -- Copy and execute: database/realtime/07_realtime_setup.sql
   ```

7. **Edge Functions Support**
   ```sql
   -- Copy and execute: database/edge-functions/08_edge_functions.sql
   ```

8. **Data Validation**
   ```sql
   -- Copy and execute: database/validation/09_data_validation.sql
   ```

9. **Compliance Features**
   ```sql
   -- Copy and execute: database/compliance/10_compliance_logging.sql
   ```

10. **Performance Optimizations**
    ```sql
    -- Copy and execute: database/performance/11_performance_optimizations.sql
    ```

### Step 3: Authentication Configuration

1. **Navigate to Authentication → Settings**

2. **Site URL Configuration**
   ```
   Site URL: https://your-production-domain.com
   ```

3. **Redirect URLs**
   ```
   Additional Redirect URLs:
   - https://your-production-domain.com
   - https://your-production-domain.com/auth/callback
   ```

4. **Email Templates** (Update to match your branding)
   - Confirmation email
   - Password reset email
   - Email change confirmation

5. **SMTP Configuration** (Recommended for production)
   ```
   SMTP Host: your-smtp-provider.com
   SMTP Port: 587
   SMTP User: your-smtp-username
   SMTP Password: your-smtp-password
   Sender Name: MedTrack
   Sender Email: noreply@your-domain.com
   ```

### Step 4: Storage Configuration

1. **Navigate to Storage**

2. **Verify Buckets Created**
   - `medtrack-attachments` (private)
   - `profile-images` (public)

3. **Configure CORS** (if needed)
   ```json
   {
     "allowedOrigins": ["https://your-production-domain.com"],
     "allowedMethods": ["GET", "POST", "PUT", "DELETE"],
     "allowedHeaders": ["*"],
     "maxAge": 3600
   }
   ```

### Step 5: Real-time Configuration

1. **Navigate to Database → Replication**

2. **Enable Real-time for Tables**
   - `api.measurements`
   - `api.doses`
   - `api.daily_logs`
   - `api.notifications`

### Step 6: Environment Variables

Configure your production environment with:

```env
# Production Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key

# Production Environment
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production

# Domain Configuration
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com

# Optional: Direct Database URL (for edge functions)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

### Step 7: Security Hardening

1. **API Rate Limiting**
   - Configure rate limits in Supabase dashboard
   - Set appropriate limits for your user base

2. **Database Security**
   ```sql
   -- Revoke unnecessary permissions
   REVOKE ALL ON SCHEMA public FROM anon;
   REVOKE ALL ON SCHEMA public FROM authenticated;
   
   -- Grant only necessary permissions
   GRANT USAGE ON SCHEMA api TO anon;
   GRANT USAGE ON SCHEMA api TO authenticated;
   ```

3. **Row Level Security Verification**
   ```sql
   -- Verify RLS is enabled on all tables
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'api' AND rowsecurity = false;
   ```

### Step 8: Monitoring & Maintenance

1. **Database Monitoring**
   - Enable log exports
   - Set up performance monitoring
   - Configure alerts for high usage

2. **Backup Strategy**
   - Enable automated backups
   - Configure backup retention (7-30 days recommended)
   - Test backup restoration process

3. **Maintenance Tasks**
   ```sql
   -- Set up periodic maintenance (run via cron or scheduled functions)
   
   -- Weekly: Update table statistics
   SELECT api.update_table_statistics();
   
   -- Daily: Refresh materialized views
   SELECT * FROM api.refresh_all_stats();
   
   -- Monthly: Apply data retention policies
   SELECT * FROM api.apply_data_retention();
   ```

## 📊 Production Optimization

### Performance Tuning

1. **Connection Pooling**
   - Use PgBouncer for high-traffic applications
   - Configure connection limits appropriately

2. **Query Optimization**
   ```sql
   -- Monitor slow queries
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

3. **Index Monitoring**
   ```sql
   -- Check index usage
   SELECT * FROM api.performance_stats 
   WHERE metric_type = 'index_usage' 
   AND value = 'unused';
   ```

### Scaling Considerations

1. **Database Plan Selection**
   - Start with Pro plan
   - Monitor usage and scale up as needed
   - Consider dedicated compute for high-traffic

2. **CDN Configuration**
   - Use CDN for static assets
   - Enable storage CDN for file attachments

3. **Edge Functions**
   - Deploy compute-heavy operations to edge functions
   - Use for data processing and external API calls

## 🔒 Security Best Practices

### 1. API Key Management
- Rotate API keys regularly
- Use different keys for different environments
- Never expose service role key in client-side code

### 2. Database Access
- Use least privilege principle
- Regular security audits
- Monitor access patterns

### 3. Compliance Monitoring
```sql
-- Regular compliance checks
SELECT api.generate_compliance_report();

-- Monitor data access
SELECT * FROM api.audit_logs 
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

## 🚨 Troubleshooting

### Common Production Issues

1. **Connection Limits**
   ```sql
   -- Check active connections
   SELECT count(*) FROM pg_stat_activity;
   ```

2. **Performance Issues**
   ```sql
   -- Check database size
   SELECT pg_database_size('postgres');
   
   -- Check largest tables
   SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
   FROM pg_tables
   WHERE schemaname = 'api'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Authentication Issues**
   - Verify site URL configuration
   - Check SMTP settings
   - Validate redirect URLs

### Emergency Procedures

1. **Database Rollback**
   ```sql
   -- Point-in-time recovery (contact Supabase support)
   -- Or restore from backup
   ```

2. **Rate Limit Issues**
   - Temporarily increase limits in dashboard
   - Implement client-side rate limiting
   - Add caching layer

3. **Storage Issues**
   - Monitor storage usage
   - Implement file cleanup policies
   - Consider external storage for large files

## 📈 Monitoring & Analytics

### Key Metrics to Track

1. **Database Performance**
   - Query response times
   - Connection pool usage
   - Table sizes and growth

2. **API Usage**
   - Request volumes
   - Error rates
   - Response times

3. **Storage Usage**
   - File upload volumes
   - Storage costs
   - CDN hit rates

### Alerting Setup

Configure alerts for:
- High CPU usage (>80%)
- Database connection limits (>80%)
- Storage usage (>80%)
- API error rates (>5%)
- Failed authentication attempts

## 🔄 Deployment Pipeline

### Recommended Workflow

1. **Development → Staging → Production**
2. **Database migrations testing**
3. **Performance testing with production data volumes**
4. **Security testing and penetration testing**
5. **Compliance verification**

### Migration Strategy

```bash
# Generate migration from staging
supabase db diff --linked --schema api > new_migration.sql

# Test migration on staging
supabase db reset --linked

# Apply to production (coordinate with team)
# Execute via Supabase dashboard during maintenance window
```

This production setup ensures your MedTrack application is secure, performant, and compliant with medical data requirements! 🏥 