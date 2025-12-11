-- Migration: Add AI Analysis and Reviewer Notes Fields
-- Date: December 2025
-- Description: Add fields to support data validation page functionality

DO $$
BEGIN
    -- Add aianalysis column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment' AND column_name = 'aianalysis'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN aianalysis TEXT;
        COMMENT ON COLUMN Assessment.aianalysis IS 'AI-generated analysis text from scoring engine';
    END IF;

    -- Add reviewernotes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment' AND column_name = 'reviewernotes'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN reviewernotes TEXT;
        COMMENT ON COLUMN Assessment.reviewernotes IS 'Notes and observations from reviewer/auditor';
    END IF;
END $$;

-- Note: scoringdetails column does not exist in current schema, skipping migration

-- Verify the changes
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
