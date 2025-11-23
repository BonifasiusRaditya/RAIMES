-- Migration to ensure Assessment table has all required columns
-- Run this to prepare database for complete assessment functionality

-- Ensure finalscore column exists and has correct type
DO $$ 
BEGIN
    -- Check if finalscore column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assessment' 
        AND column_name = 'finalscore'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN finalScore DECIMAL(5, 2);
        RAISE NOTICE 'Added finalScore column to Assessment table';
    END IF;

    -- Check if completiondate column exists, if not add it
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assessment' 
        AND column_name = 'completiondate'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN completionDate TIMESTAMP WITHOUT TIME ZONE;
        RAISE NOTICE 'Added completionDate column to Assessment table';
    END IF;

    -- Check if status column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'assessment' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'in_progress';
        RAISE NOTICE 'Added status column to Assessment table';
    END IF;
END $$;

-- Update existing assessments that don't have a status
UPDATE Assessment 
SET status = 'in_progress' 
WHERE status IS NULL OR status = '';

-- Create index for faster queries on completed assessments
CREATE INDEX IF NOT EXISTS idx_assessment_status_completed 
ON Assessment(status) 
WHERE status = 'completed';

-- Create index for faster queries on assessment with scores
CREATE INDEX IF NOT EXISTS idx_assessment_finalscore 
ON Assessment(finalScore) 
WHERE finalScore IS NOT NULL;

-- Verify the schema
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'assessment'
    AND column_name IN ('finalscore', 'completiondate', 'status', 'startdate', 'companyid', 'questionnaireid');
    
    IF column_count >= 6 THEN
        RAISE NOTICE '✅ Assessment table schema is ready for complete assessment functionality';
    ELSE
        RAISE WARNING '⚠️ Assessment table may be missing some required columns. Expected 6, found %', column_count;
    END IF;
END $$;

-- Display current Assessment table structure
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'assessment'
ORDER BY ordinal_position;
