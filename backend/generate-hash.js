import bcrypt from 'bcryptjs';

// Password yang sama untuk semua user: "password123"
const password = 'password123';
const saltRounds = 10;

async function generateHashes() {
    console.log('Generating password hashes...\n');
    
    // Generate 3 different hashes for the same password
    // (bcrypt creates unique hash each time due to unique salt)
    const hash1 = await bcrypt.hash(password, saltRounds);
    const hash2 = await bcrypt.hash(password, saltRounds);
    const hash3 = await bcrypt.hash(password, saltRounds);
    
    console.log('Password:', password);
    console.log('\nHash 1 (admin):', hash1);
    console.log('Hash 2 (user1):', hash2);
    console.log('Hash 3 (auditor1):', hash3);
    
    console.log('\n\nCopy paste this SQL:\n');
    console.log(`INSERT INTO "User" (username, password, email, role) VALUES`);
    console.log(`('admin', '${hash1}', 'admin@raimes.com', 'admin'),`);
    console.log(`('user1', '${hash2}', 'user1@raimes.com', 'user'),`);
    console.log(`('auditor1', '${hash3}', 'auditor1@raimes.com', 'auditor');`);
}

generateHashes();
