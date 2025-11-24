# AI Scoring System Guide - RAIMES

## Overview

The AI Scoring System in RAIMES integrates with the external AI Engine API (`https://ai-engine-raimes.vercel.app`) to automatically score completed assessments. It provides intelligent evaluation of responses with fallback capability when the AI Engine is unavailable.

---

## Architecture

### Components

1. **ai_scoring.ts** - Core scoring service with AI Engine integration
2. **assessmentController.ts** - API endpoints for scoring operations
3. **assessmentRoutes.ts** - Route definitions for scoring endpoints
4. **Database** - Assessment table with scoring fields

### Scoring Fields in Database

```sql
ALTER TABLE Assessment ADD COLUMN (
  finalscore DECIMAL(5,2),              -- Final score out of 100
  scoringdetails JSONB,                 -- Detailed scoring results
  scoreddate TIMESTAMP                  -- When scoring was performed
);
```

---

## API Endpoints

### 1. Score Assessment

**Endpoint:** `POST /api/assessments/score`

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "assessmentId": 123
}
```

**Response - Success:**
```json
{
  "success": true,
  "message": "Assessment scored successfully",
  "scoring": {
    "individual_scores": {
      "Environmental Management": {
        "score": 78.5,
        "feedback": "Good response with adequate detail",
        "category": "Environmental Management"
      },
      "Social Responsibility": {
        "score": 82.0,
        "feedback": "Comprehensive response with good coverage",
        "category": "Social Responsibility"
      }
    },
    "overall_score": 80.25,
    "recommendations": [
      "Continue to improve documentation of sustainability practices",
      "Enhance monitoring and measurement systems"
    ],
    "strengths": [
      "Commitment to sustainability assessment",
      "Participation in formal evaluation process"
    ],
    "weaknesses": [],
    "detailed_analysis": "Assessment completed with comprehensive coverage of all areas."
  }
}
```

**Response - Error:**
```json
{
  "success": false,
  "message": "Assessment must be completed before scoring",
  "error": "Assessment status is 'in_progress'"
}
```

**Preconditions:**
- Assessment must be in "completed" status
- All questions must be answered
- Assessment not already scored

---

### 2. Get Assessment Scoring Result

**Endpoint:** `GET /api/assessments/:assessmentId/scoring`

**Authentication:** Required (JWT Token)

**Response - Success:**
```json
{
  "success": true,
  "assessment": {
    "assessmentid": 123,
    "companyname": "PT Mining Corp",
    "questionnairename": "Responsible Mining Practices",
    "finalscore": 80.25,
    "status": "scored",
    "scoring": {
      "individual_scores": { ... },
      "overall_score": 80.25,
      "recommendations": [ ... ],
      "strengths": [ ... ],
      "weaknesses": [ ... ],
      "detailed_analysis": "..."
    }
  }
}
```

**Response - Error:**
```json
{
  "success": false,
  "message": "Assessment has not been scored yet"
}
```

---

### 3. Get Scoring Statistics

**Endpoint:** `GET /api/assessments/statistics/:questionnaireId`

**Authentication:** Required (JWT Token)

**Response - Success:**
```json
{
  "success": true,
  "statistics": {
    "totalAssessments": 15,
    "scoredCount": 12,
    "averageScore": "75.50",
    "minScore": "45.00",
    "maxScore": "95.00",
    "stddevScore": "12.50"
  }
}
```

---

## Scoring Algorithm

### AI Engine Scoring (Primary)

When AI Engine is available, it performs comprehensive evaluation:

1. **Input Processing**: Validates all answers and question data
2. **Category Analysis**: Scores response by assessment category
3. **Evidence Assessment**: Evaluates presence of metrics and data
4. **Feedback Generation**: Provides specific improvement suggestions
5. **Score Calculation**: Weighs categories and generates final score

### Fallback Scoring Algorithm

When AI Engine is unavailable, uses rule-based scoring:

```
Score Calculation:
- Response < 50 chars: 40 points
- Response 50-200 chars: 60 points
- Response 200-500 chars: 75 points
- Response > 500 chars: 85 points
- Contains metrics/data: +10 bonus points
- No response: 0 points

Category Score = Average of weighted question scores
Overall Score = Average of all category scores (0-100)
```

---

## Database Schema

### Assessment Table Extensions

```sql
-- Core assessment fields (existing)
CREATE TABLE Assessment (
  assessmentid SERIAL PRIMARY KEY,
  companyid INTEGER REFERENCES Company(companyid),
  questionnaireid INTEGER REFERENCES Questionnaire(questionnaireid),
  status VARCHAR(20), -- 'pending', 'in_progress', 'completed', 'scored'
  startdate TIMESTAMP,
  completiondate TIMESTAMP,
  
  -- New scoring fields
  finalscore DECIMAL(5,2),              -- Score out of 100
  scoringdetails JSONB,                 -- Full scoring result object
  scoreddate TIMESTAMP,                 -- When AI scoring was performed
  
  UNIQUE(companyid, questionnaireid)
);

-- Scoring details JSON structure:
{
  "individual_scores": {
    "category_name": {
      "score": number,
      "feedback": string,
      "category": string
    }
  },
  "overall_score": number,
  "recommendations": string[],
  "strengths": string[],
  "weaknesses": string[],
  "detailed_analysis": string
}
```

---

## Service Functions

### Core Functions in ai_scoring.ts

#### 1. `getAssessmentData(assessmentid: number)`
Retrieves complete assessment data including answers and questions.

**Returns:**
```typescript
{
  assessmentid: number,
  companyid: number,
  questionnaireid: number,
  answers: Array<{questionid, response}>,
  questions: Array<{questionid, text, category, weight, type, require_evidence}>
}
```

---

#### 2. `prepareScoringData(assessmentData: AssessmentData)`
Transforms assessment data into format expected by AI Engine.

**Returns:**
```typescript
{
  assessmentid: number,
  answers: Array<{
    questionid: number,
    text: string,
    answer: string,
    category: string,
    weight: number
  }>
}
```

---

#### 3. `callAIEngine(scoringData: ScoringRequest)`
Makes HTTP request to AI Engine API with timeout handling.

**Request Format:**
```json
{
  "assessmentid": 123,
  "answers": [
    {
      "questionid": 1,
      "text": "What are your environmental practices?",
      "answer": "We implement...",
      "category": "Environmental Management",
      "weight": 1.0
    }
  ]
}
```

**Returns:**
```typescript
{
  success: boolean,
  scoring?: ScoringResult,
  error?: string
}
```

---

#### 4. `scoreAssessment(assessmentid: number)`
Main function that orchestrates the complete scoring process.

**Process:**
1. Validate assessment exists and is completed
2. Load assessment data
3. Check all questions are answered
4. Attempt AI Engine scoring
5. Fall back to algorithm if needed
6. Save results to database
7. Return scoring result

**Returns:**
```typescript
{
  success: boolean,
  scoring?: ScoringResult,
  error?: string
}
```

---

#### 5. `getScoringResult(assessmentid: number)`
Retrieves previously calculated scoring result.

**Returns:** `ScoringResult | null`

---

#### 6. `getScoringStatistics(questionnaireid: number)`
Gets aggregate statistics for all assessments in a questionnaire.

**Returns:**
```typescript
{
  total_assessments: number,
  scored_count: number,
  average_score: number,
  min_score: number,
  max_score: number,
  stddev_score: number
}
```

---

#### 7. `batchScoreAssessments(assessmentIds: number[])`
Scores multiple assessments sequentially with delays.

**Returns:**
```typescript
{
  success: boolean,
  results: Array<{
    assessmentid: number,
    success: boolean,
    score?: number,
    error?: string
  }>
}
```

---

## Environment Configuration

### Required Environment Variables

```bash
# AI Engine Configuration
AI_ENGINE_URL=https://ai-engine-raimes.vercel.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/raimes

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your-secret-key
```

---

## Error Handling

### Common Error Scenarios

| Error | Cause | Solution |
|-------|-------|----------|
| Assessment not found | Invalid assessmentId | Verify assessmentId exists |
| Unauthorized access | User doesn't own assessment | Check user authentication |
| Assessment not completed | Status is not 'completed' | Complete assessment first |
| All questions must be answered | Unanswered questions exist | Answer all questions |
| AI Engine unavailable | Network/API error | Fallback scoring used |

### Logging

Comprehensive logging at each stage:

```
🎯 Starting assessment scoring for ID: 123
📋 Assessment data loaded: 10 questions, 10 answers
✅ Scoring data prepared
🤖 Calling AI Engine at https://ai-engine-raimes.vercel.app/api/score
✅ AI Engine response received
✅ Assessment scoring saved to database
📊 Final Score: 80.25/100
```

---

## Usage Examples

### Frontend Integration (React)

```javascript
// Score an assessment
const scoreAssessment = async (assessmentId) => {
  try {
    const response = await fetch('/api/assessments/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ assessmentId })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Score:', data.scoring.overall_score);
      console.log('Recommendations:', data.scoring.recommendations);
    }
  } catch (error) {
    console.error('Scoring failed:', error);
  }
};

// Get scoring results
const getResults = async (assessmentId) => {
  const response = await fetch(`/api/assessments/${assessmentId}/scoring`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  if (data.success) {
    return data.assessment.scoring;
  }
};
```

### Backend Integration (TypeScript)

```typescript
import { scoreAssessment, batchScoreAssessments } from './ai_service/ai_scoring.js';

// Score single assessment
const result = await scoreAssessment(123);
if (result.success) {
  console.log('Final Score:', result.scoring.overall_score);
}

// Batch score multiple assessments
const batchResult = await batchScoreAssessments([123, 124, 125]);
console.log('Completed:', batchResult.results);
```

---

## Performance Optimization

### Considerations

1. **AI Engine Response Time**: ~2-5 seconds per assessment
2. **Batch Processing**: Add 500ms delay between requests to avoid overload
3. **Database Indexing**: Ensure indexes on assessmentid, questionnaireid, companyid
4. **Caching**: Scoring results cached in database

### Recommendations

```sql
-- Add indexes for better performance
CREATE INDEX idx_assessment_status ON Assessment(status);
CREATE INDEX idx_assessment_questionnaire ON Assessment(questionnaireid);
CREATE INDEX idx_assessment_company ON Assessment(companyid);
CREATE INDEX idx_assessment_finalscore ON Assessment(finalscore);
```

---

## Monitoring & Debugging

### Logging Levels

The system includes detailed logging:

- 🎯 High-level operations
- 📋 Data loading and validation
- ✅ Successful operations
- ⚠️ Warnings and fallback scenarios
- ❌ Errors and failures
- 📊 Results and statistics

### Debug Mode

Set environment variable for verbose logging:
```bash
DEBUG=raimes:ai-scoring node app.js
```

---

## Troubleshooting

### AI Engine Connection Failed

**Problem:** Getting "AI Engine unavailable" errors

**Solutions:**
1. Verify AI Engine URL is correct: `https://ai-engine-raimes.vercel.app`
2. Check network connectivity
3. Verify AI Engine is running: `curl https://ai-engine-raimes.vercel.app/health`
4. System will use fallback scoring automatically

### Scoring Results Look Incorrect

**Problem:** Scores seem too high/low

**Solutions:**
1. Check answer lengths (affects fallback scoring)
2. Verify all questions were answered
3. Check category weights in database
4. Review AI Engine response in logs

### Batch Scoring Taking Too Long

**Problem:** Large batch scoring is slow

**Solutions:**
1. Increase delay between requests in `batchScoreAssessments`
2. Score in smaller batches (50-100 at a time)
3. Run scoring in background job
4. Check AI Engine performance

---

## Future Enhancements

1. **Async Scoring**: Background job queue for large batches
2. **Progressive Scoring**: Score as user completes assessment
3. **Custom Scoring Models**: Questionnaire-specific algorithms
4. **Score Recalculation**: Update scores when AI Engine improves
5. **Score Trending**: Track score changes over time
6. **Export Reports**: Generate PDF scoring reports

---

## Support

For issues or questions:
1. Check logs for error messages
2. Review this guide's troubleshooting section
3. Verify database schema matches requirements
4. Test AI Engine connectivity directly
5. Contact AI Engine support team

---

**Last Updated:** November 24, 2025  
**Version:** 1.0.0
