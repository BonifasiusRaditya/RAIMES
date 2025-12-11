import pool from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Running database migration to add aianalysis and reviewernotes columns...');

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '..', '..', 'add_validation_fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    console.log('📄 Migration file loaded:', migrationPath);

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('✅ Columns aianalysis and reviewernotes have been added to Assessment table.');

    // Verify the changes
    const verifyQuery = `
      SELECT 
        table_name,
        column_name,
        data_type,
        is_nullable,
        character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'assessment' 
        AND column_name IN ('aianalysis', 'reviewernotes')
      ORDER BY ordinal_position;
    `;

    const result = await pool.query(verifyQuery);
    console.log('\n📊 Verification Results:');
    console.table(result.rows);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

runMigration();
