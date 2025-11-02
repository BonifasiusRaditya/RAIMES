import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Try to use connection string if available, otherwise use individual params
const connectionString = process.env.DATABASE_URL;

let pool: Pool;

if (connectionString) {
    // Use connection string (recommended for Supabase)
    pool = new Pool({
        connectionString,
        ssl: {
            rejectUnauthorized: false
        },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });
    console.log('📌 Using DATABASE_URL connection string');
} else {
    // Use individual parameters
    const isSupabase = process.env.DB_HOST?.includes('supabase.co');
    
    const poolConfig: any = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'raimes_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    };
    
    // Add SSL configuration for Supabase
    if (isSupabase) {
        poolConfig.ssl = {
            rejectUnauthorized: false
        };
    }
    
    pool = new Pool(poolConfig);
    console.log('📌 Using individual database parameters');
}

// Test connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
    process.exit(-1);
});

export default pool;
