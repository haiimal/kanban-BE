# Supabase Setup Guide

This project has been configured to work with Supabase PostgreSQL. Follow these steps to set up your environment.

## Environment Variables

Add the following environment variables to your `.env` file:

### Required Supabase Variables
```env
# Set to true to use Supabase, false for traditional PostgreSQL
USE_SUPABASE=true

# Supabase Project Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Supabase Database Connection (for Sequelize)
SUPABASE_DB_HOST=db.your-project-ref.supabase.co
SUPABASE_DB_PORT=5432
SUPABASE_DB_NAME=postgres
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your_supabase_db_password_here
```

### Optional: Traditional PostgreSQL (when USE_SUPABASE=false)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database_name
DB_USERNAME=your_username
DB_PASSWORD=your_password
```

## Getting Supabase Credentials

1. **Create a Supabase Project**: Go to [supabase.com](https://supabase.com) and create a new project
2. **Get Project URL**: In your project dashboard, go to Settings > API
3. **Get API Keys**: 
   - `SUPABASE_URL`: Your project URL
   - `SUPABASE_ANON_KEY`: The `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY`: The `service_role` `secret` key
4. **Get Database Credentials**: Go to Settings > Database
   - `SUPABASE_DB_HOST`: Connection pooling host (usually `db.your-project-ref.supabase.co`)
   - `SUPABASE_DB_PASSWORD`: Your database password
   - `SUPABASE_DB_USER`: Usually `postgres`
   - `SUPABASE_DB_NAME`: Usually `postgres`

## Usage

### Using Supabase Client (Recommended for new features)
```typescript
import { supabase, supabaseAdmin } from './config/supabase.js';

// Client-side operations (with RLS)
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Server-side operations (bypasses RLS)
const { data, error } = await supabaseAdmin
  .from('your_table')
  .select('*');
```

### Using Sequelize (Existing code)
Your existing Sequelize code will continue to work. The configuration automatically switches between Supabase and traditional PostgreSQL based on the `USE_SUPABASE` environment variable.

## Migration

To migrate your existing database to Supabase:

1. Set up your Supabase project and get credentials
2. Set `USE_SUPABASE=true` in your environment
3. Run your existing migrations: `npm run sequelize:migrate`
4. Your data will be migrated to Supabase

## Features Available

- **Row Level Security (RLS)**: Use Supabase client for automatic RLS
- **Real-time subscriptions**: Built-in real-time features
- **Authentication**: Integrate with Supabase Auth
- **Storage**: File storage capabilities
- **Edge Functions**: Serverless functions

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that your Supabase project is active
- Verify database credentials in Supabase dashboard
- Make sure SSL is enabled (already configured in the setup)
