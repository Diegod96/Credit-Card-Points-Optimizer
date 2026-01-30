# CardStack

A credit card points and cashback optimization platform that helps users maximize their rewards across multiple card ecosystems.

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript check
- `npm run format` - Format code with Prettier
- `npm run db:push` - Push Prisma schema to database
- `npm run db:studio` - Open Prisma Studio

## Tech Stack

- **Frontend:** Next.js 14, React 18, TypeScript, TailwindCSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** Neon (serverless PostgreSQL)
- **Cache:** Upstash Redis
- **Auth:** NextAuth.js
- **State:** React Query, Zustand

## Project Structure

```
cardstack/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state stores
│   └── types/               # TypeScript types
├── prisma/                  # Database schema and migrations
└── plans/                   # Project documentation
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
