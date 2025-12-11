import pool from '../config/database.js';
import { getAIScoreForAssessment } from '../ai_service/ai_scoring.js';

/**
 * Re-score all completed assessments that have null or 0 finalscore
 */
async function rescoreAssessments() {
  try {
    console.log('🔍 Finding completed assessments needing scoring...');

    // Find all completed assessments with null or 0 finalscore
    const query = `
      SELECT assessmentid, finalscore, status
      FROM Assessment
      WHERE status = 'completed' AND (finalscore IS NULL OR finalscore = 0)
      ORDER BY completiondate DESC
    `;

    const result = await pool.query(query);
    console.log(`📊 Found ${result.rows.length} assessments to re-score`);

    if (result.rows.length === 0) {
      console.log('✅ No assessments need re-scoring');
      process.exit(0);
    }

    // Re-score each assessment
    for (const row of result.rows) {
      const assessmentId = row.assessmentid;
      console.log(`\n🎯 Re-scoring assessment ${assessmentId}...`);
      console.log(`   Current finalscore: ${row.finalscore}`);

      try {
        const aiResult = await getAIScoreForAssessment(assessmentId);
        
        if (aiResult.success && aiResult.score !== undefined) {
          console.log(`✅ Assessment ${assessmentId} scored: ${aiResult.score}`);
        } else {
          console.log(`❌ Failed to score assessment ${assessmentId}:`, aiResult.error);
        }
      } catch (error) {
        console.error(`❌ Error scoring assessment ${assessmentId}:`, error);
      }

      // Add a small delay to avoid overwhelming the AI service
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n✅ Re-scoring complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error in rescore script:', error);
    process.exit(1);
  }
}

// Run the script
rescoreAssessments();
