-- Insert sample users with hashed passwords
-- Password untuk semua user: "password123"
-- Hash generated dengan bcrypt saltRounds=10

INSERT INTO "User" (username, password, email, role) VALUES
('admin', '$2b$10$fqhC2e9d2WZTmshuIKm6eOp9cNDCKs9ixtEvSCVp6Q2UY7b8UUO3m', 'admin@raimes.com', 'admin'),
('user1', '$2b$10$pp1E/x0EyvAcXZMsk82tJuWLeA.oK4l5e.yp9Gtb8n40HuDeFLJ6m', 'user1@raimes.com', 'user'),
('auditor1', '$2b$10$jn65aE.upjswheLmU3pRnO92CqVWxMur0j4ukfyGSDkIbOXD369J.', 'auditor1@raimes.com', 'auditor');

-- Login credentials:
-- Username: admin    | Password: password123 | Role: admin
-- Username: user1    | Password: password123 | Role: user
-- Username: auditor1 | Password: password123 | Role: auditor

drop table if exists "User";

