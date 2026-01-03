const jwt = require('jsonwebtoken');
const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function runTest() {
  try {
    // 1. Setup Test Data
    const userId = 'test-user-' + Date.now();
    const teamId = 'test-team-' + Date.now();
    const email = `test-${Date.now()}@example.com`;

    console.log('Creates test user & team...');
    
    await sql`
      INSERT INTO users (id, email, name, password) 
      VALUES (${userId}, ${email}, 'Test User', 'hashedpassword')
    `;

    await sql`
      INSERT INTO teams (id, name, slug) 
      VALUES (${teamId}, 'Test Team', ${'slug-' + Date.now()})
    `;

    await sql`
      INSERT INTO team_members (id, "userId", "teamId", role) 
      VALUES (${'tm-' + Date.now()}, ${userId}, ${teamId}, 'OWNER')
    `;

    // 2. Generate Token
    const payload = {
      userId: userId,
      teamId: teamId,
      role: 'OWNER'
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');

    // 3. Call API
    console.log(`Calling API with token...`);
    const response = await fetch('http://localhost:3000/api/ai/pre-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        content: "INVOICE #001\nTo: PT Client\nAmount: Rp 1.000.000\nTax: 10% (Should be 11% in Indonesia)\nDate: 2024-01-01",
        documentType: "Invoice",
        category: "financial"
      })
    });

    const status = response.status;
    const text = await response.text();
    
    console.log('Status:', status);
    try {
        const json = JSON.parse(text);
        console.log('Response:', JSON.stringify(json, null, 2));
    } catch {
        console.log('Response Text:', text);
    }

    // 4. Cleanup
    console.log('Cleaning up...');
    await sql`DELETE FROM users WHERE id = ${userId}`;
    await sql`DELETE FROM teams WHERE id = ${teamId}`;

  } catch (err) {
    console.error('Test Failed:', err);
  } finally {
    await sql.end();
  }
}

runTest();
