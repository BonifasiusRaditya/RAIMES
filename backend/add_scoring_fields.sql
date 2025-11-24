-- Migration: Add AI Scoring Fields to Assessment Table
-- Date: November 24, 2025
-- Description: Add fields to support AI-based assessment scoring

-- Check if fields already exist before adding
DO $$
BEGIN
    -- Add finalscore column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Assessment' AND column_name = 'finalscore'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN finalscore DECIMAL(5,2);
        COMMENT ON COLUMN Assessment.finalscore IS 'Final score out of 100 from AI scoring';
    END IF;

    -- Add scoringdetails column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Assessment' AND column_name = 'scoringdetails'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN scoringdetails JSONB;
        COMMENT ON COLUMN Assessment.scoringdetails IS 'Detailed scoring results from AI Engine';
    END IF;

    -- Add scoreddate column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Assessment' AND column_name = 'scoreddate'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN scoreddate TIMESTAMP;
        COMMENT ON COLUMN Assessment.scoreddate IS 'Timestamp when assessment was scored';
    END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_assessment_status 
    ON Assessment(status);

CREATE INDEX IF NOT EXISTS idx_assessment_questionnaire 
    ON Assessment(questionnaireid);

CREATE INDEX IF NOT EXISTS idx_assessment_company 
    ON Assessment(companyid);

CREATE INDEX IF NOT EXISTS idx_assessment_finalscore 
    ON Assessment(finalscore);

CREATE INDEX IF NOT EXISTS idx_assessment_scoreddate 
    ON Assessment(scoreddate);

-- Create a GIN index for JSONB scoring details for faster queries
CREATE INDEX IF NOT EXISTS idx_assessment_scoringdetails 
    ON Assessment USING GIN(scoringdetails);

-- Update existing assessments with 'completed' status that don't have a completiondate
-- to add a default completiondate (for backwards compatibility)
UPDATE Assessment 
SET completiondate = startdate + INTERVAL '1 hour'
WHERE status = 'completed' AND completiondate IS NULL;

-- Verify the changes
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'Assessment' 
    AND column_name IN ('finalscore', 'scoringdetails', 'scoreddate')
ORDER BY ordinal_position;

-- Display current table structure
\d Assessment
