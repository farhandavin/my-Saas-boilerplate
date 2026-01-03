import 'dotenv/config';
import { db } from '../src/db';
import { teams, transactions, invoices, users, teamMembers } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  console.log('🌱 Seeding Financial Data...');

  // 1. Get or Create a Test User
  const userEmail = 'demo@example.com';
  let user = await db.query.users.findFirst({
      where: eq(users.email, userEmail)
  });

  if (!user) {
    const [newUser] = await db.insert(users).values({
      email: userEmail,
      name: 'Demo Owner',
      provider: 'email'
    }).returning();
    user = newUser;
    console.log('Created User:', user.email);
  }

  // 2. Get or Create a Test Team linked to User
  let team = await db.query.teams.findFirst();
  
  if (!team) {
    const [newTeam] = await db.insert(teams).values({
      name: 'Test Enterprise Corp',
      slug: 'test-corp',
      tier: 'PRO'
    }).returning();
    team = newTeam;
    console.log('Created Team:', team.id);
  }

  // 3. Ensure User is Team Owner
  const member = await db.query.teamMembers.findFirst({
      where: (t, { and, eq }) => and(eq(t.userId, user!.id), eq(t.teamId, team!.id))
  });

  if (!member) {
      await db.insert(teamMembers).values({
          userId: user.id,
          teamId: team.id,
          role: 'ADMIN'
      });
      console.log('Linked User as Team Owner');
  }

  const teamId = team.id;

  // 2. Create Transactions (Income/Expense)
  console.log('Creating Transactions...');
  await db.insert(transactions).values([
    {
      teamId,
      date: new Date(), // Today
      amount: 15000000,
      type: 'INCOME',
      category: 'Project Payment',
      description: 'Payment for Phase 1',
      status: 'COMPLETED'
    },
    {
      teamId,
      date: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
      amount: 5000000,
      type: 'EXPENSE',
      category: 'Server Costs',
      description: 'Monthly Cloud Bill',
      status: 'COMPLETED'
    },
    {
      teamId,
      date: new Date(new Date().setDate(new Date().getDate() - 2)), // 2 days ago
      amount: 45000000,
      type: 'INCOME',
      category: 'Consulting',
      description: 'Big Client deal',
      status: 'COMPLETED'
    }
  ]);

  // 3. Create Invoices
  console.log('Creating Invoices...');
  await db.insert(invoices).values([
    {
      teamId,
      clientName: 'PT Maju Mundur',
      amount: 75000000,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 5)), // Overdue 5 days
      status: 'OVERDUE'
    },
    {
      teamId,
      clientName: 'CV Sejahtera',
      amount: 25000000,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)), // Due in 10 days
      status: 'UNPAID'
    }
  ]);

  console.log('✅ Seeding Complete! CEO Digest should now clearly show Revenue and Overdue Invoices.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // Unlike Prisma, purely postgres-js based connection handles disconnect differently or relies on process exit
    // If using pooling, might need to await client.end() if exported.
    // For script, process.exit is fine.
    process.exit(0);
  });
