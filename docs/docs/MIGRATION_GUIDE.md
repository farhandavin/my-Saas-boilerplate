# Migration Guide

Step-by-step instructions for migrating to **Enterprise Business OS** from other platforms.

---

## Table of Contents

- [From ShipFast](#from-shipfast)
- [From Divjoy](#from-divjoy)
- [From SaasRock](#from-saasrock)
- [From Custom Build](#from-custom-build)
- [General Tips](#general-tips)

---

## From ShipFast

**Effort**: Medium (3-5 days)  
**Main Challenges**: Adding multi-tenancy, restructuring for RBAC

### Step 1: Database Migration

ShipFast uses MongoDB. You'll need to migrate to PostgreSQL.

1. **Export ShipFast data**:
   ```javascript
   // In ShipFast project
   const users = await db.collection('users').find().toArray();
   fs.writeFileSync('users.json', JSON.stringify(users));
   ```

2. **Import to Enterprise BOS**:
   ```typescript
   // Create migration script: scripts/migrate-from-shipfast.ts
   import { db } from '@/db';
   import { users, teams } from '@/db/schema';
   import usersData from './users.json';

   for (const user of usersData) {
     await db.insert(users).values({
       email: user.email,
       name: user.name,
       // Map ShipFast fields to our schema
     });
   }
   ```

### Step 2: Authentication

**ShipFast uses**: NextAuth.js (Auth.js)  
**Enterprise BOS uses**: Custom JWT

**Migration**:
1. User passwords remain valid (both use bcrypt)
2. Sessions will be invalidated (users must log in again)
3. OAuth connections preserved if using same Google Client ID

**No code changes needed** - our auth system handles this automatically.

### Step 3: Stripe Integration

**Compatible!** Both use Stripe.

1. **Keep existing Stripe customers**:
   - No migration needed
   - Update webhook URL: `https://your-new-app.com/api/webhooks/stripe`

2. **Map subscription data**:
   ```typescript
   // In our billingService.ts
   const customer = await stripe.customers.retrieve(stripeCustomerId);
   // Auto-syncs to our `teams` table
   ```

### Step 4: Add Multi-Tenancy

ShipFast is single-user. You'll need to:

1. **Create default team for each user**:
   ```typescript
   for (const user of users) {
     const team = await db.insert(teams).values({
       name: `${user.name}'s Team`,
       ownerId: user.id,
     });
     
     await db.insert(members).values({
       userId: user.id,
       teamId: team.id,
       role: 'owner',
     });
   }
   ```

2. **Update queries** to include `teamId` filter.

### Step 5: UI Components

**Both use**: Tailwind CSS + shadcn/ui

**Migration**:
- Copy your custom components to `src/components/`
- Update imports (ShipFast uses `@/components/ui`, same as us)
- Minor styling tweaks for dark mode compatibility

### Estimated Timeline

| Task | Time |
|------|------|
| Database export/import | 4 hours |
| Multi-tenancy setup | 8 hours |
| Component migration | 6 hours |
| Testing | 6 hours |
| **Total** | **24 hours** |

---

## From Divjoy

**Effort**: Low (1-2 days)  
**Main Challenges**: Switching ORM (Prisma → Drizzle)

### Step 1: Database Schema

Divjoy uses Prisma. Enterprise BOS uses Drizzle.

1. **Keep existing database** - no data migration needed
2. **Update schema** to Drizzle format:

**Divjoy (Prisma)**:
```prisma
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String?
}
```

**Enterprise BOS (Drizzle)**:
```typescript
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: text('email').notNull().unique(),
  name: text('name'),
});
```

3. **Run migration**:
   ```bash
   npx drizzle-kit push
   ```

### Step 2: Authentication

**Both use**: NextAuth.js (Auth.js)

If you want to keep NextAuth, you can! But we recommend switching to our custom JWT for edge compatibility.

**Optional migration** to custom JWT:
- Users must log in again (sessions invalidated)
- Password hashes remain valid

### Step 3: Components

**Compatible!** Both use shadcn/ui.

Simply copy your components:
```bash
cp -r divjoy-project/components/* enterprise-bos/src/components/
```

### Step 4: API Routes

Divjoy uses Pages Router (`/pages/api/*`).  
Enterprise BOS uses App Router (`/app/api/*`).

**Convert**:
```typescript
// Divjoy (Pages Router)
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello' });
}

// Enterprise BOS (App Router)
export async function GET(request: Request) {
  return Response.json({ message: 'Hello' });
}
```

### Estimated Timeline

| Task | Time |
|------|------|
| Schema migration | 2 hours |
| Component copy | 1 hour |
| API route conversion | 4 hours |
| Testing | 3 hours |
| **Total** | **10 hours** |

---

## From SaasRock

**Effort**: High (1-2 weeks)  
**Main Challenges**: Framework change (Remix → Next.js)

### Step 1: Database

**Compatible!** Both use PostgreSQL.

1. **Export schema**:
   ```bash
   pg_dump your_database > saasrock_backup.sql
   ```

2. **Import to new database**:
   ```bash
   psql new_database < saasrock_backup.sql
   ```

3. **Update schema** to match our Drizzle schema (field mappings)

### Step 2: Remix → Next.js Migration

This is the hardest part. Remix and Next.js have different paradigms.

**Remix (Loaders/Actions)**:
```typescript
export const loader = async ({ request }) => {
  return json({ data: await fetchProjects() });
};
```

**Next.js (Server Components)**:
```typescript
export default async function ProjectsPage() {
  const projects = await fetchProjects();
  return <div>{projects.map(...)}</div>;
}
```

**Recommendation**: Rewrite pages from scratch using our templates.

### Step 3: Authentication

**SaasRock uses**: Remix Auth  
**Enterprise BOS uses**: Custom JWT

- Passwords remain valid (both use bcrypt)
- Sessions invalidated
- OAuth connections preserved

### Estimated Timeline

| Task | Time |
|------|------|
| Database import | 4 hours |
| Page rewrites | 40 hours |
| Component migration | 10 hours |
| Testing | 10 hours |
| **Total** | **64 hours (1.5 weeks)** |

**Recommendation**: Consider building new features incrementally rather than full migration.

---

## From Custom Build

**Effort**: Variable (depends on your stack)

### Step 1: Assess Compatibility

| Your Stack | Compatibility | Migration Path |
|------------|--------------|----------------|
| **Next.js** | ✅ High | Keep routing, update to App Router if using Pages Router |
| **Express/Node** | ⚠️ Medium | Rewrite API routes to Next.js API routes |
| **Django/Flask** | ❌ Low | Rebuild from scratch, keep database |
| **Prisma ORM** | ✅ High | Schema is compatible, rewrite to Drizzle |
| **PostgreSQL** | ✅ High | Keep database, add our schema tables |
| **Stripe** | ✅ High | Update webhook URL, keep customers |

### Step 2: Database Migration

1. **Add our tables** to your existing database:
   ```bash
   # Run our schema migrations
   npx drizzle-kit push
   ```

2. **Map your data** to our schema:
   ```typescript
   // Example: Migrate your users table
   await db.insert(users).values({
     id: yourUser.id,
     email: yourUser.email,
     currentTeamId: defaultTeam.id, // New field
   });
   ```

### Step 3: Incremental Migration Strategy

**Don't migrate everything at once!** Use this approach:

1. **Week 1**: Set up Enterprise BOS, migrate authentication
2. **Week 2**: Migrate Stripe billing, keep existing customers
3. **Week 3**: Rebuild admin dashboard using our templates
4. **Week 4**: Migrate core features one-by-one

**Run both apps in parallel** during transition:
- Old app: `yourapp.com`
- New app: `new.yourapp.com`
- Gradually redirect users

### Step 4: Frontend Migration

If your frontend is React-based:
- **Keep components**: Copy to `src/components/`
- **Add Tailwind**: Our theme is compatible
- **Update routing**: Convert to Next.js App Router

If not React:
- Rebuild UI using our templates
- **Estimated time**: 40-80 hours depending on complexity

---

## General Tips

### Data Integrity Checklist

Before going live with migrated data:

- [ ] All users can log in with existing passwords
- [ ] Stripe subscriptions still active
- [ ] OAuth connections work
- [ ] No duplicate records in database
- [ ] Foreign keys properly mapped
- [ ] Timestamps preserved (createdAt, updatedAt)

### Testing Strategy

1. **Create test accounts** in both old and new systems
2. **Compare outputs** (API responses, UI behavior)
3. **Run E2E tests** before switching DNS
4. **Beta test** with 5-10 real users
5. **Monitor errors** for first 48 hours post-launch

### Rollback Plan

Always have a rollback strategy:

1. **Database backup** before migration
2. **Keep old app running** for 2 weeks
3. **DNS points to old app** until 100% confident
4. **Feature flags** to toggle old vs new logic

### Need Help?

Email **farhandavin14@gmail.com** with:
- Your current stack
- Estimated dataset size (users, records)
- Migration timeline

We'll provide personalized guidance.

---

## Migration Assistance (Paid Service)

For complex migrations (100K+ users, multi-tenant legacy data), we offer paid migration assistance:

**What's included**:
- 1-on-1 consultation call (1 hour)
- Custom migration scripts for your schema
- Database optimization & index setup
- Post-migration testing support

**Pricing**: $500-$1500 depending on complexity  
**Contact**: farhandavin14@gmail.com

---

**Last Updated**: January 3, 2026
