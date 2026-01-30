# Testing Strategy

**Purpose:** Define testing approach, tools, coverage targets, and critical test scenarios for CardStack

---

## Test Pyramid

```
            ╱╲
           ╱  ╲         E2E Tests (10%)
          ╱────╲        - Critical user flows
         ╱      ╲       - Cross-browser testing
        ╱────────╲      
       ╱          ╲     Integration Tests (30%)
      ╱────────────╲    - API routes
     ╱              ╲   - Database operations
    ╱────────────────╲  - Component integration
   ╱                  ╲
  ╱   Unit Tests (60%) ╲  - Business logic
 ╱──────────────────────╲ - Utilities & Components
```

---

## Testing Tools

| Type | Tool | Purpose |
|------|------|---------|
| Unit Tests | Jest | Business logic, utilities |
| Component Tests | React Testing Library | UI components |
| Integration Tests | Jest + Supertest | API routes |
| E2E Tests | Playwright | Critical user flows |
| Coverage | Jest Coverage | Track test coverage |

---

## Coverage Targets

| Category | Target | Minimum |
|----------|--------|---------|
| Business Logic | 90% | 80% |
| API Routes | 80% | 70% |
| UI Components | 70% | 60% |
| Utilities | 95% | 85% |
| **Overall** | **75%** | **65%** |

---

## Critical Test Scenarios

### Authentication

```typescript
describe('Authentication', () => {
  it('should register a new user with email/password')
  it('should login with valid credentials')
  it('should reject invalid credentials')
  it('should redirect unauthenticated users to login')
  it('should handle OAuth callback correctly')
  it('should logout and clear session')
})
```

### Points Calculation

```typescript
describe('Points Calculation', () => {
  it('should calculate points with base rate')
  it('should apply category multipliers correctly')
  it('should handle cashback cards (percentage)')
  it('should handle rotating categories')
  it('should calculate across multiple cards')
})
```

### Plaid Integration

```typescript
describe('Plaid Integration', () => {
  it('should create link token for authenticated user')
  it('should exchange public token for access token')
  it('should sync transactions from Plaid')
  it('should handle Plaid webhook events')
  it('should handle Plaid errors gracefully')
})
```

### Simulator

```typescript
describe('Simulator', () => {
  it('should calculate impact of adding a new card')
  it('should calculate impact of replacing a card')
  it('should account for annual fees')
  it('should show category-by-category breakdown')
})
```

---

## Running Tests

```bash
# Run all unit and integration tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

---

## E2E Test Flows

| Flow | Priority | Description |
|------|----------|-------------|
| Onboarding | P0 | Register → Link Card → View Dashboard |
| Daily Use | P0 | Login → Check Points → View Transactions |
| Simulator | P1 | Navigate → Add Card → View Results |
| Settings | P1 | Update Preferences → Verify Saved |
