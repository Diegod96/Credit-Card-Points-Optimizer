# Phase 1: Foundation

**Duration:** Weeks 1-2  
**Goal:** Set up development environment, implement authentication, create base UI components

---

## Week 1: Project Setup & Infrastructure

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Initialize Next.js 14 project with TypeScript | P0 | 2h | ☐ |
| Configure ESLint, Prettier, Husky pre-commit hooks | P0 | 2h | ☐ |
| Set up Tailwind CSS with custom theme (light/dark mode) | P0 | 3h | ☐ |
| Create Neon database and configure Prisma | P0 | 2h | ☐ |
| Set up Upstash Redis instance | P1 | 1h | ☐ |
| Configure Vercel project with environment variables | P0 | 2h | ☐ |
| Set up Sentry error tracking | P1 | 1h | ☐ |
| Create GitHub repository with branch protection rules | P0 | 1h | ☐ |
| Configure GitHub Actions CI pipeline | P0 | 3h | ☐ |

### Commands

```bash
# Initialize Next.js project
npx create-next-app@latest cardstack --typescript --tailwind --eslint --app --src-dir

# Install core dependencies
npm install @prisma/client @tanstack/react-query zustand
npm install -D prisma

# Install auth dependencies
npm install next-auth @auth/prisma-adapter bcryptjs
npm install -D @types/bcryptjs

# Install UI dependencies
npm install lucide-react recharts react-hook-form zod @hookform/resolvers

# Install dev tools
npm install -D husky lint-staged prettier
npx husky init
```

### Project Structure

```
cardstack/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/
│   │   │   ├── page.tsx
│   │   │   └── layout.tsx
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── modal.tsx
│   │   └── layouts/
│   │       ├── dashboard-layout.tsx
│   │       └── auth-layout.tsx
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── redis.ts
│   │   └── auth.ts
│   ├── hooks/
│   │   └── use-theme.ts
│   ├── stores/
│   │   └── theme-store.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── .github/
│   └── workflows/
│       └── ci.yml
└── package.json
```

---

## Week 2: Authentication & Base UI

### Tasks

| Task | Priority | Estimate | Status |
|------|----------|----------|--------|
| Implement NextAuth.js with Prisma adapter | P0 | 4h | ☐ |
| Create Google OAuth provider integration | P0 | 2h | ☐ |
| Implement email/password authentication | P0 | 4h | ☐ |
| Build login/register pages | P0 | 4h | ☐ |
| Create password reset flow with Resend | P1 | 3h | ☐ |
| Build dashboard layout shell (sidebar, header) | P0 | 4h | ☐ |
| Create reusable UI components (Button, Card, Input, Modal) | P0 | 6h | ☐ |
| Implement dark mode toggle with persistence | P1 | 2h | ☐ |
| Set up React Query and Zustand stores | P0 | 2h | ☐ |

### Prisma Schema (Initial)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  passwordHash  String?   @map("password_hash")
  name          String?
  image         String?
  emailVerified DateTime? @map("email_verified")
  
  subscriptionTier String @default("free") @map("subscription_tier")
  preferences      Json   @default("{}")
  
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  accounts Account[]
  sessions Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(uuid())
  userId            String  @map("user_id")
  type              String
  provider          String
  providerAccountId String  @map("provider_account_id")
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique @map("session_token")
  userId       String   @map("user_id")
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

### NextAuth.js Configuration

```typescript
// src/lib/auth.ts

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

### Environment Variables

```bash
# .env.local

# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/cardstack?sslmode=require"

# Auth (NextAuth.js)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Email (Resend)
RESEND_API_KEY="re_xxx"

# Monitoring (Sentry)
SENTRY_DSN="https://xxx@sentry.io/xxx"
```

### GitHub Actions CI

```yaml
# .github/workflows/ci.yml

name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm run test
      
      - name: Generate Prisma client
        run: npx prisma generate
      
      - name: Build
        run: npm run build
```

---

## Deliverables

- [ ] Working authentication flow (login, register, logout)
- [ ] Google OAuth integration
- [ ] Protected dashboard route with layout
- [ ] Dark/light mode toggle with persistence
- [ ] Reusable UI component library
- [ ] CI pipeline running on all PRs
- [ ] Development environment fully configured

---

## Testing Checklist

- [ ] Auth flow unit tests (NextAuth callbacks)
- [ ] Login form validation tests
- [ ] Register form validation tests
- [ ] Protected route redirect tests
- [ ] UI component snapshot tests
- [ ] Dark mode toggle tests

---

## Definition of Done

- All tasks completed and tested
- Code reviewed and merged to staging
- CI pipeline passing
- Documentation updated
- No critical bugs
