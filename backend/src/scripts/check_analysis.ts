import pool from '../config/database.js';

async function checkAnalysis() {
  try {
    console.log('🔍 Checking AI analysis in database...\n');

    // Get all assessments with their AI analysis
    const query = `
      SELECT 
        a.assessmentid,
        c.companyname,
        a.finalscore,
        a.status,
        a.completiondate,
        LENGTH(a.aianalysis) as analysis_length,
        LEFT(a.aianalysis, 200) as analysis_preview
      FROM Assessment a
      LEFT JOIN Company c ON a.companyid = c.companyid
      WHERE a.status = 'completed'
      ORDER BY a.completiondate DESC
      LIMIT 10;
    `;

    const result = await pool.query(query);

    console.log('📊 Recent completed assessments:\n');
    console.table(result.rows.map(row => ({
      ID: row.assessmentid,
      Company: row.companyname,
      Score: row.finalscore,
      Status: row.status,
      'Analysis Length': row.analysis_length || 0,
      'Has Analysis': row.analysis_length > 0 ? 'Yes' : 'No',
      'Preview': row.analysis_preview || 'NULL'
    })));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAnalysis();
