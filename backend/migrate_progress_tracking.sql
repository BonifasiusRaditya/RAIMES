-- Migration script to update database schema for progress tracking
-- Run this after the existing schema

-- Update Assessment table to support both user and company assessments
ALTER TABLE Assessment 
ADD COLUMN IF NOT EXISTS userID INT REFERENCES "User"(userID),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Make companyID optional (for individual user assessments)
ALTER TABLE Assessment 
ALTER COLUMN companyID DROP NOT NULL;

-- Add constraint to ensure either userID or companyID is provided
ALTER TABLE Assessment 
ADD CONSTRAINT check_user_or_company CHECK (
  (userID IS NOT NULL AND companyID IS NULL) OR 
  (userID IS NULL AND companyID IS NOT NULL)
);

-- Update Answer table to track creation/update timestamps
ALTER TABLE Answer 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Create trigger to automatically update updated_at timestamp for Assessment
CREATE OR REPLACE FUNCTION update_assessment_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_assessment_updated_at ON Assessment;
CREATE TRIGGER update_assessment_updated_at 
    BEFORE UPDATE ON Assessment 
    FOR EACH ROW 
    EXECUTE FUNCTION update_assessment_updated_at_column();

-- Create trigger to automatically update updated_at timestamp for Answer
CREATE OR REPLACE FUNCTION update_answer_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_answer_updated_at ON Answer;
CREATE TRIGGER update_answer_updated_at 
    BEFORE UPDATE ON Answer 
    FOR EACH ROW 
    EXECUTE FUNCTION update_answer_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_user_questionnaire ON Assessment(userID, questionnaireID);
CREATE INDEX IF NOT EXISTS idx_assessment_company_questionnaire ON Assessment(companyID, questionnaireID);
CREATE INDEX IF NOT EXISTS idx_assessment_status ON Assessment(status);
CREATE INDEX IF NOT EXISTS idx_answer_assessment ON Answer(assessmentID);
CREATE INDEX IF NOT EXISTS idx_answer_question ON Answer(questionID);

-- Insert some sample data for testing (optional)
-- You can comment this out if you don't want sample data

-- Sample questionnaire
INSERT INTO Questionnaire (title, version, description, standard) 
VALUES ('Environmental Impact Assessment', 'v1.0', 'Assessment for environmental compliance in mining operations', 'ISO 14001')
ON CONFLICT DO NOTHING;

-- Sample questions for the questionnaire
INSERT INTO Question (questionnaireID, text, type, weight, category, require_evidence, options)
SELECT 
  q.questionnaireID,
  'How does your company assess environmental impact before starting mining operations?',
  'essay',
  8,
  'Environmental Management',
  true,
  NULL
FROM Questionnaire q 
WHERE q.title = 'Environmental Impact Assessment'
ON CONFLICT DO NOTHING;

INSERT INTO Question (questionnaireID, text, type, weight, category, require_evidence, options)
SELECT 
  q.questionnaireID,
  'Does your company have an environmental management system in place?',
  'multiple_choice',
  7,
  'Environmental Management', 
  true,
  '["Yes, fully implemented", "Yes, partially implemented", "No, but planned", "No, not planned"]'::jsonb
FROM Questionnaire q 
WHERE q.title = 'Environmental Impact Assessment'
ON CONFLICT DO NOTHING;

INSERT INTO Question (questionnaireID, text, type, weight, category, require_evidence, options)
SELECT 
  q.questionnaireID,
  'What measures does your company take to minimize water pollution during mining activities?',
  'essay',
  9,
  'Water Management',
  true,
  NULL
FROM Questionnaire q 
WHERE q.title = 'Environmental Impact Assessment'
ON CONFLICT DO NOTHING;

-- Sample Company data
INSERT INTO Company (companyName, address, registrationDate, userID)
SELECT 
  'PT Mining Example',
  'Jakarta, Indonesia', 
  CURRENT_DATE,
  u.userID
FROM "User" u 
WHERE u.role = 'user' 
LIMIT 1
ON CONFLICT DO NOTHING;

-- Sample assessment (in progress)
INSERT INTO Assessment (companyID, questionnaireID, status, startDate)
SELECT 
  c.companyID,
  q.questionnaireID,
  'in_progress',
  CURRENT_TIMESTAMP - INTERVAL '2 days'
FROM Company c, Questionnaire q
WHERE c.companyName = 'PT Mining Example' 
  AND q.title = 'Environmental Impact Assessment'
ON CONFLICT DO NOTHING;

-- Sample answers for the assessment
INSERT INTO Answer (assessmentID, questionID, response, created_at)
SELECT 
  a.assessmentID,
  qu.questionID,
  'We conduct comprehensive environmental impact assessments following international standards and local regulations.',
  CURRENT_TIMESTAMP - INTERVAL '1 day'
FROM Assessment a
JOIN Questionnaire q ON a.questionnaireID = q.questionnaireID
JOIN Question qu ON q.questionnaireID = qu.questionnaireID
JOIN Company c ON a.companyID = c.companyID
WHERE c.companyName = 'PT Mining Example'
  AND q.title = 'Environmental Impact Assessment'
  AND qu.type = 'essay'
LIMIT 1
ON CONFLICT (assessmentID, questionID) DO NOTHING;
