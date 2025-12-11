-- Migration: Add questionreviewernotes column to Assessment table
-- Purpose: Store per-question reviewer notes as JSONB
-- Format: { "questionId": "note text", ... }

DO $$ 
BEGIN
    -- Add questionreviewernotes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assessment' 
        AND column_name = 'questionreviewernotes'
    ) THEN
        ALTER TABLE Assessment ADD COLUMN questionreviewernotes JSONB;
        RAISE NOTICE 'Added questionreviewernotes column to Assessment table';
    ELSE
        RAISE NOTICE 'questionreviewernotes column already exists in Assessment table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'assessment' 
AND column_name = 'questionreviewernotes';
