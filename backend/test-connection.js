import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');
    
    console.log('Connection Details:');
    console.log('Host:', process.env.DB_HOST);
    console.log('Port:', process.env.DB_PORT);
    console.log('Database:', process.env.DB_NAME);
    console.log('User:', process.env.DB_USER);
    console.log('Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-4) : 'NOT SET');
    console.log('\n');

    const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000,
    });

    try {
        console.log('Attempting to connect...');
        const client = await pool.connect();
        console.log('✅ Connection successful!\n');

        // Test query
        console.log('Running test query...');
        const result = await client.query('SELECT NOW() as current_time, current_database() as database');
        console.log('✅ Query successful!');
        console.log('Current Time:', result.rows[0].current_time);
        console.log('Database:', result.rows[0].database);
        console.log('\n');

        // Check if User table exists
        console.log('Checking if User table exists...');
        const tableCheck = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'User'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            console.log('✅ User table exists');
            
            // Count users
            const userCount = await client.query('SELECT COUNT(*) FROM "User"');
            console.log(`📊 Total users in database: ${userCount.rows[0].count}`);
        } else {
            console.log('⚠️  User table does NOT exist');
            console.log('Run insert.sql in Supabase SQL Editor to create tables');
        }

        client.release();
        await pool.end();
        
        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Connection failed:');
        console.error('Error:', error.message);
        console.error('\nPossible issues:');
        console.error('1. Check if .env file has correct Supabase credentials');
        console.error('2. Verify Supabase project is active');
        console.error('3. Check if IP is allowed in Supabase settings');
        console.error('4. Verify internet connection');
        
        await pool.end();
        process.exit(1);
    }
}

testConnection();
