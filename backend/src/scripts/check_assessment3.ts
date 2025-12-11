import pool from '../config/database.js';

async function checkAssessment3() {
  try {
    const query = `
      SELECT 
        assessmentid,
        finalscore,
        aianalysis,
        LENGTH(aianalysis) as analysis_length
      FROM Assessment
      WHERE assessmentid = 3;
    `;

    const result = await pool.query(query);
    console.log('\n📊 Assessment 3 data:');
    console.log(JSON.stringify(result.rows[0], null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAssessment3();
