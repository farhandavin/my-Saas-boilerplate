// scripts/create-test-account.ts
// Create a test account for TestSprite testing

import { db } from '../src/db';
import { users, teams, teamMembers } from '../src/db/schema';
import bcrypt from 'bcryptjs';

async function createTestAccount() {
    const testEmail = 'testsprite@test.com';
    const testPassword = 'TestSprite123!';

    console.log('🧪 Creating TestSprite test account...');

    try {
        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: (users, { eq }) => eq(users.email, testEmail)
        });

        if (existingUser) {
            console.log('✅ Test account already exists');
            console.log('📧 Email:', testEmail);
            console.log('🔑 Password:', testPassword);
            return;
        }

        // Create user with team in transaction
        const hashedPassword = await bcrypt.hash(testPassword, 12);

        await db.transaction(async (tx) => {
            // Create user
            const [newUser] = await tx.insert(users).values({
                email: testEmail,
                name: 'TestSprite User',
                password: hashedPassword,
                provider: 'email',
            }).returning();

            // Create team
            const [newTeam] = await tx.insert(teams).values({
                name: 'TestSprite Team',
                slug: 'testsprite-team-' + Date.now(),
                tier: 'PRO', // PRO tier for testing all features
                aiTokenLimit: 10000,
            }).returning();

            // Add user to team as ADMIN
            await tx.insert(teamMembers).values({
                userId: newUser.id,
                teamId: newTeam.id,
                role: 'ADMIN'
            });

            console.log('✅ Test account created successfully!');
            console.log('📧 Email:', testEmail);
            console.log('🔑 Password:', testPassword);
            console.log('👤 User ID:', newUser.id);
            console.log('🏢 Team ID:', newTeam.id);
            console.log('🎫 Tier: PRO');
        });

    } catch (error) {
        console.error('❌ Error creating test account:', error);
        throw error;
    }
}

createTestAccount()
    .then(() => {
        console.log('\\n✅ Test account setup complete');
        process.exit(0);
    })
    .catch((err) => {
        console.error('\\n❌ Failed to create test account:', err);
        process.exit(1);
    });
