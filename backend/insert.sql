CREATE TABLE "User" IF NOT EXISTS (
    userID SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT    NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL
);

CREATE TABLE Company IF NOT EXISTS (
    companyID SERIAL PRIMARY KEY,
    companyName VARCHAR(255) NOT NULL,
    address TEXT,
    registrationDate DATE,
    userID INT REFERENCES "User"(userID)
);

CREATE TABLE Questionnaire IF NOT EXISTS(
    questionnaireID SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    version VARCHAR(50),
    description TEXT,
    standard VARCHAR(100)
);

CREATE TABLE Question IF NOT EXISTS(
    questionID SERIAL PRIMARY KEY,
    questionnaireID INT REFERENCES Questionnaire(questionnaireID),
    text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('essay', 'multiple_choice')),
    weight INTEGER NOT NULL DEFAULT 1 CHECK (weight >= 1 AND weight <= 10),
    category VARCHAR(100) NOT NULL,
    require_evidence BOOLEAN NOT NULL DEFAULT false,
    options JSONB NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Assessment IF NOT EXISTS(
    assessmentID SERIAL PRIMARY KEY,
    companyID INT NOT NULL REFERENCES Company(companyID),
    questionnaireID INT NOT NULL REFERENCES Questionnaire(questionnaireID),
    status VARCHAR(50) NOT NULL,
    finalScore DECIMAL(5, 2),
    startDate TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    completionDate TIMESTAMP WITHOUT TIME ZONE
);

CREATE TABLE Answer IF NOT EXISTS(
    answerID SERIAL PRIMARY KEY,
    assessmentID INT NOT NULL REFERENCES Assessment(assessmentID),
    questionID INT NOT NULL REFERENCES Question(questionID),
    response TEXT,
    UNIQUE (assessmentID, questionID)
);

CREATE TABLE Evidence IF NOT EXISTS(
    evidenceID SERIAL PRIMARY KEY,
    answerID INT NOT NULL REFERENCES Answer(answerID),
    fileName VARCHAR(255) NOT NULL,
    fileType VARCHAR(50),
    uploadDate TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    uploaderID INT REFERENCES "User"(userID),
    storagePath VARCHAR(500) NOT NULL
);

CREATE TABLE Report IF NOT EXISTS(
    reportID SERIAL PRIMARY KEY,
    assessmentID INT NOT NULL REFERENCES Assessment(assessmentID),
    generatedDate TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    format VARCHAR(50),
    content TEXT,
    UNIQUE (assessmentID)
);

CREATE TABLE AccountRequest IF NOT EXISTS(
    requestID SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    companyName VARCHAR(255) NOT NULL,
    affiliationProofFileName VARCHAR(255) NOT NULL,
    affiliationProofPath VARCHAR(500) NOT NULL,
    affiliationProofType VARCHAR(50),
    status VARCHAR(50) DEFAULT 'pending',
    requestDate TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    adminNotes TEXT,
    reviewedDate TIMESTAMP WITHOUT TIME ZONE,
    reviewedBy INT REFERENCES "User"(userID)
);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_question_updated_at ON Question;
CREATE TRIGGER update_question_updated_at 
    BEFORE UPDATE ON Question 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
