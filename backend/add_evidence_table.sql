-- Ensure Evidence table exists for storing uploaded supporting documents
CREATE TABLE IF NOT EXISTS Evidence (
    evidenceid SERIAL PRIMARY KEY,
    answerid INTEGER NOT NULL,
    filename VARCHAR(255) NOT NULL,
    originalname VARCHAR(255),
    filetype VARCHAR(128),
    storagepath VARCHAR(1024) NOT NULL,
    uploaddate TIMESTAMPTZ DEFAULT NOW(),
    uploaderid INTEGER,
    CONSTRAINT fk_evidence_answer FOREIGN KEY (answerid) REFERENCES Answer(answerid) ON DELETE CASCADE,
    CONSTRAINT fk_evidence_user FOREIGN KEY (uploaderid) REFERENCES "User"(userid) ON DELETE SET NULL
);

ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS originalname VARCHAR(255);
ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS filetype VARCHAR(128);
ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS storagepath VARCHAR(1024);
ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS uploaddate TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE Evidence ADD COLUMN IF NOT EXISTS uploaderid INTEGER;

CREATE INDEX IF NOT EXISTS idx_evidence_answerid ON Evidence(answerid);
CREATE INDEX IF NOT EXISTS idx_evidence_uploaderid ON Evidence(uploaderid);
