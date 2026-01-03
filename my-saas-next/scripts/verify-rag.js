const jwt = require('jsonwebtoken');
const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL);

async function runTest() {
  try {
    // 0. Enable pgvector if not exists (usually handled by migration)
    try {
      await sql`CREATE EXTENSION IF NOT EXISTS vector`;
      console.log('Ensure pgvector extension exists...');
    } catch (e) {
      console.log('Skipping CREATE EXTENSION (might need superuser or already exists)');
    }

    // 1. Setup Test Data
    const userId = 'rag-user-' + Date.now();
    const teamId = 'rag-team-' + Date.now();
    const email = `rag-${Date.now()}@example.com`;

    console.log('Creates test user & team for RAG...');
    
    await sql`
      INSERT INTO users (id, email, name, password) 
      VALUES (${userId}, ${email}, 'RAG Tester', 'hashedpassword')
    `;

    await sql`
      INSERT INTO teams (id, name, slug) 
      VALUES (${teamId}, 'RAG Team', ${'rag-slug-' + Date.now()})
    `;

    await sql`
      INSERT INTO team_members (id, "userId", "teamId", role) 
      VALUES (${'tm-rag-' + Date.now()}, ${userId}, ${teamId}, 'OWNER')
    `;

    // 2. Generate Token
    const payload = {
      userId: userId,
      teamId: teamId,
      role: 'OWNER'
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret');

    // 3. Upload Document
    console.log(`Uploading Document...`);
    const uploadRes = await fetch('http://localhost:3000/api/ai/rag/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: "Company Leave Policy 2024",
        content: "Employees are entitled to 20 days of annual leave. Sick leave is unlimited but requires a doctor's value note for more than 3 days. Remote work is allowed on Fridays."
      })
    });

    const uploadJson = await uploadRes.json();
    console.log('Upload Status:', uploadRes.status);
    console.log('Upload Response:', uploadJson);

    if (uploadRes.status !== 200) {
      throw new Error('Upload failed');
    }

    // 4. Query Document
    console.log(`Querying RAG...`);
    const queryRes = await fetch('http://localhost:3000/api/ai/rag/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query: "can i work from home on friday?"
      })
    });

    const queryJson = await queryRes.json();
    console.log('Query Status:', queryRes.status);
    console.log('Query Response:', JSON.stringify(queryJson, null, 2));

    // 5. Cleanup
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
