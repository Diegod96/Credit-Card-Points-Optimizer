# Skills & Roles

> Required skills and suggested team structure for building CardStack

---

## Core Skills Required

### Frontend Development

| Skill | Level | Used For |
|-------|-------|----------|
| **React 18** | Advanced | UI components, hooks, state management |
| **Next.js 14** | Advanced | App Router, API routes, SSR/SSG |
| **TypeScript** | Intermediate+ | Type safety throughout codebase |
| **TailwindCSS** | Intermediate | Styling, responsive design, dark mode |
| **React Query** | Intermediate | Server state management, caching |
| **Zustand** | Basic | Client state management |
| **Recharts** | Basic | Data visualization, charts |
| **React Hook Form** | Basic | Form handling, validation |

### Backend Development

| Skill | Level | Used For |
|-------|-------|----------|
| **Node.js** | Intermediate+ | API routes, background jobs |
| **Prisma ORM** | Intermediate | Database queries, migrations, schema |
| **PostgreSQL** | Intermediate | Data modeling, queries, indexes |
| **Redis** | Basic | Caching, rate limiting |
| **REST API Design** | Intermediate | API architecture, endpoints |
| **Authentication** | Intermediate | NextAuth.js, OAuth, JWT |

### Third-Party Integrations

| Skill | Level | Used For |
|-------|-------|----------|
| **Plaid API** | Intermediate | Bank account linking, transactions |
| **Stripe API** | Intermediate | Subscriptions, payments |
| **OpenAI API** | Basic | AI recommendations (Pro tier) |
| **Resend/Email** | Basic | Transactional emails |

### DevOps & Infrastructure

| Skill | Level | Used For |
|-------|-------|----------|
| **Git/GitHub** | Intermediate | Version control, PRs, CI/CD |
| **Vercel** | Basic | Deployment, preview environments |
| **GitHub Actions** | Basic | CI/CD pipelines, automated testing |
| **Neon/Supabase** | Basic | Serverless database management |

### Testing

| Skill | Level | Used For |
|-------|-------|----------|
| **Jest** | Intermediate | Unit tests, integration tests |
| **React Testing Library** | Intermediate | Component testing |
| **Playwright** | Basic | E2E testing |

---

## Suggested Team Structure

### Minimum Viable Team (Solo/Duo)

For MVP development with 1-2 developers:

```
┌─────────────────────────────────────┐
│         Full-Stack Developer        │
│  (All frontend + backend + DevOps)  │
└─────────────────────────────────────┘
```

**Required skills:** Must be comfortable across the entire stack. Focus on:
- Next.js full-stack development
- Prisma + PostgreSQL
- Plaid integration
- Basic DevOps (Vercel deployment)

---

### Small Team (3-4 people)

```
┌─────────────────┐  ┌─────────────────┐
│    Frontend     │  │    Backend      │
│    Developer    │  │    Developer    │
└─────────────────┘  └─────────────────┘
         │                   │
         └─────────┬─────────┘
                   │
         ┌─────────┴─────────┐
         │   Full-Stack Lead  │
         │   (Architecture)   │
         └───────────────────┘
```

| Role | Responsibilities |
|------|------------------|
| **Full-Stack Lead** | Architecture, code review, integrations (Plaid, Stripe), DevOps |
| **Frontend Dev** | UI components, dashboard, charts, responsive design |
| **Backend Dev** | API routes, database, points calculation, background jobs |

---

### Growth Team (5-7 people)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│  Frontend   │  │  Frontend   │  │   Backend   │
│  Developer  │  │  Developer  │  │  Developer  │
└─────────────┘  └─────────────┘  └─────────────┘
       │               │                │
       └───────────────┼────────────────┘
                       │
              ┌────────┴────────┐
              │   Tech Lead     │
              └────────┬────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
    ┌────┴────┐  ┌─────┴─────┐  ┌────┴────┐
    │ DevOps  │  │  Product  │  │   QA    │
    │         │  │  Manager  │  │         │
    └─────────┘  └───────────┘  └─────────┘
```

| Role | Responsibilities |
|------|------------------|
| **Tech Lead** | Architecture, mentoring, code review, technical decisions |
| **Frontend Dev (x2)** | Dashboard, card explorer, simulator, settings |
| **Backend Dev** | APIs, Plaid, points engine, projections |
| **DevOps** | CI/CD, monitoring, infrastructure, security |
| **Product Manager** | Roadmap, user research, feature prioritization |
| **QA Engineer** | Test strategy, automation, bug tracking |

---

## Skill Development Path

### For Junior Developers

**Phase 1 (Weeks 1-2): Foundations**
- Complete Next.js tutorial
- Learn TailwindCSS basics
- Understand React Query patterns
- Set up local development environment

**Phase 2 (Weeks 3-4): Database & Auth**
- Learn Prisma schema design
- Understand NextAuth.js flows
- Practice API route development
- Write first unit tests

**Phase 3 (Weeks 5-8): Features**
- Build UI components
- Implement CRUD operations
- Learn Plaid sandbox
- Write integration tests

---

### For Mid-Level Developers

**Week 1: Architecture Review**
- Understand project structure
- Review database schema
- Study API patterns
- Set up development environment

**Week 2: Core Contribution**
- Pick up feature tasks
- Implement with tests
- Participate in code reviews
- Document learnings

---

## Hiring Recommendations

### Must-Have Skills (Non-Negotiable)

1. **TypeScript** - Entire codebase is TypeScript
2. **React Hooks** - All components use hooks
3. **REST API Design** - Core product functionality
4. **SQL/Databases** - Financial data requires solid DB skills

### Nice-to-Have Skills

1. Plaid or fintech experience
2. Stripe integration experience
3. Previous startup/0-to-1 experience
4. Credit card rewards domain knowledge

### Red Flags

- No TypeScript experience
- Only class-based React experience
- No testing experience
- Poor communication skills

---

## External Resources

### Learning Resources

| Topic | Resource |
|-------|----------|
| Next.js 14 | [Official Tutorial](https://nextjs.org/learn) |
| TypeScript | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/) |
| Prisma | [Prisma Getting Started](https://www.prisma.io/docs/getting-started) |
| React Query | [TkDodo's Blog](https://tkdodo.eu/blog/practical-react-query) |
| Plaid | [Plaid Quickstart](https://plaid.com/docs/quickstart/) |
| NextAuth.js | [NextAuth.js Tutorial](https://next-auth.js.org/getting-started/example) |

### Recommended Courses

| Course | Platform | Level |
|--------|----------|-------|
| "Build a Full-Stack App with Next.js" | Frontend Masters | Intermediate |
| "SQL and PostgreSQL" | Udemy | Beginner |
| "Testing JavaScript" | Testing JavaScript | Advanced |

---

## Skill Matrix Template

Use this to assess team members:

```
Name: _______________
Role: _______________

Frontend Skills (1-5):
├── React:        [ ]
├── Next.js:      [ ]
├── TypeScript:   [ ]
├── TailwindCSS:  [ ]
└── React Query:  [ ]

Backend Skills (1-5):
├── Node.js:      [ ]
├── Prisma:       [ ]
├── PostgreSQL:   [ ]
├── REST APIs:    [ ]
└── Auth:         [ ]

Integrations (1-5):
├── Plaid:        [ ]
├── Stripe:       [ ]
└── OpenAI:       [ ]

Testing (1-5):
├── Unit Tests:   [ ]
├── E2E Tests:    [ ]
└── TDD:          [ ]

DevOps (1-5):
├── Git:          [ ]
├── CI/CD:        [ ]
└── Vercel:       [ ]

Soft Skills (1-5):
├── Communication:    [ ]
├── Problem Solving:  [ ]
└── Collaboration:    [ ]

Total Score: ___/80
```

**Scoring Guide:**
- **1** = No experience
- **2** = Basic understanding, needs guidance
- **3** = Can work independently on standard tasks
- **4** = Advanced, can handle complex problems
- **5** = Expert, can mentor others

---

## Contractor/Freelancer Considerations

### When to Use Contractors

| Task | Contractor? | Reasoning |
|------|-------------|-----------|
| Core features | ❌ No | Need institutional knowledge |
| UI polish | ✅ Yes | Well-defined, isolated |
| Card database entry | ✅ Yes | Data entry, low risk |
| Security audit | ✅ Yes | Specialized expertise |
| Performance optimization | ⚠️ Maybe | Depends on scope |

### Freelancer Platforms

| Platform | Best For |
|----------|----------|
| Toptal | Senior developers, vetted |
| Upwork | Various skill levels |
| Arc | Remote developers |
| Gun.io | US-based freelancers |

### Budget Estimates (US rates)

| Role | Hourly Rate | Monthly (Full-time) |
|------|-------------|---------------------|
| Junior Developer | $30-50/hr | $5,000-8,000 |
| Mid-Level Developer | $60-100/hr | $10,000-16,000 |
| Senior Developer | $100-150/hr | $16,000-24,000 |
| Tech Lead | $150-200/hr | $24,000-32,000 |
