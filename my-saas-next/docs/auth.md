# Authentication Service Documentation

## 📚 Overview
The **Authentication Service** (`src/services/authService.ts`) handles user registration, login (via standard JWT flow), and team onboarding. Unlike managed solutions (Clerk, Auth0), this project uses a **custom implementation** to provide full control over the database schema and multi-tenancy logic.

## 🔐 Core Features

### 1. Registration (Admin/Owner)
- **Function**: `register(data)`
- **Flow**:
  1.  Validates email uniqueness.
  2.  Hashes password using `bcryptjs`.
  3.  **Transaction**:
      - Creates `User`.
      - Creates `Team` (slug generated from company name).
      - Creates `TeamMember` with role `ADMIN`.
      - Creates `AuditLog` (Action: `ORG_CREATED`).

### 2. Invitation-based Registration (Member)
- **Function**: `registerWithInvite(data)`
- **Flow**:
  1.  Validates implementation token string.
  2.  Checks expiration and email mismatch.
  3.  **Transaction**:
      - Creates `User`.
      - Adds `TeamMember` linked to the inviting team.
      - Deletes the used `Invitation`.
      - Creates `AuditLog` (Action: `MEMBER_JOINED`).

## 🛠️ Data Models (Schema)

| Table | Description |
| :--- | :--- |
| `users` | Stores global user profile (Name, Email, Password Hash). |
| `teams` | Represents the "Tenant" or "Organization". |
| `team_members` | Link between User and Team. Contains `role` (ADMIN, MEMBER, OBSERVER). |
| `invitations` | Temporary tokens for inviting new members. |

## 🛡️ Security Implementation
- **Password Hashing**: BCrypt (Salt Rouds: 10).
- **Session**: JWT based (implemented in `src/lib/auth.ts` / Middleware).
- **RBAC**: Roles are checked at the Service level and Middleware level.

## 🚀 Usage Example

```typescript
import { AuthService } from '@/services/authService';

// Register a new company owner
const result = await AuthService.register({
  name: "John CEO",
  email: "john@startup.com",
  password: "securePassword123",
  companyName: "John Startup Inc."
});

// Result contains { user, team }
console.log(result.team.slug); // "john-startup-inc-1735..."
```

## ⚠️ Known Limitations & Risks
- **No MFA**: Currently does not support Multi-Factor Authentication.
- **Session Management**: JWT revocation relies on short expiry times; no blacklist mechanism yet.
- **Social Login**: OAuth flow is handled separately in `oauthService.ts`.
