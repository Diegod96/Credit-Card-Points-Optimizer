# Git Flow

**Purpose:** Define branch strategy, commit conventions, PR process, and release workflow for CardStack

---

## Branch Strategy

```
main (production)
  │
  ├── staging (pre-production)
  │     │
  │     ├── feature/auth-system
  │     ├── feature/plaid-integration
  │     ├── feature/dashboard
  │     ├── fix/login-redirect
  │     └── chore/update-dependencies
  │
  └── hotfix/critical-bug (emergency fixes)
```

---

## Branch Types

| Type | Pattern | Description | Base Branch |
|------|---------|-------------|-------------|
| Feature | `feature/short-description` | New functionality | `staging` |
| Fix | `fix/short-description` | Bug fixes | `staging` |
| Hotfix | `hotfix/short-description` | Critical production fixes | `main` |
| Chore | `chore/short-description` | Maintenance, deps, docs | `staging` |
| Refactor | `refactor/short-description` | Code improvements | `staging` |

---

## Branch Naming Examples

```
feature/plaid-integration
feature/points-calculator
feature/dark-mode
fix/transaction-sync-error
fix/auth-redirect-loop
hotfix/stripe-webhook-failure
chore/update-prisma
chore/add-api-docs
refactor/extract-points-service
```

---

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no code change |
| `refactor` | Code change that neither fixes nor adds |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(auth): add Google OAuth provider
fix(plaid): handle expired access token error
docs(readme): add setup instructions
refactor(points): extract calculation to service
test(simulator): add card replacement tests
chore(deps): update Next.js to 14.1.0
```

---

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout staging
git pull origin staging
git checkout -b feature/my-feature
```

### 2. Develop and Commit

```bash
# Make changes
git add .
git commit -m "feat(scope): description"

# Keep branch updated
git fetch origin
git rebase origin/staging
```

### 3. Push and Create PR

```bash
git push origin feature/my-feature
```

### 4. PR Requirements

- [ ] Descriptive title following commit convention
- [ ] Description of changes and motivation
- [ ] Screenshots for UI changes
- [ ] Tests added/updated
- [ ] All CI checks passing
- [ ] At least 1 approval required
- [ ] No merge conflicts

---

## PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Refactor
- [ ] Documentation

## Screenshots (if applicable)

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
```

---

## Merge Strategy

| Target Branch | Merge Method | Notes |
|---------------|--------------|-------|
| `staging` ← feature | Squash merge | Clean history |
| `main` ← `staging` | Merge commit | Preserve staging history |
| `main` ← hotfix | Merge commit | Then merge to staging |

---

## Release Process

### Regular Release (Weekly)

```bash
# 1. Ensure staging is tested
git checkout staging
git pull origin staging

# 2. Create release PR to main
# - Title: "Release vX.Y.Z"
# - Include changelog

# 3. After merge, tag release
git checkout main
git pull origin main
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 4. Vercel auto-deploys main to production
```

### Hotfix Process

```bash
# 1. Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Make fix, commit, push
git commit -m "fix(critical): description"
git push origin hotfix/critical-fix

# 3. Create PR to main (expedited review)

# 4. After merge to main, also merge to staging
git checkout staging
git merge main
git push origin staging
```

---

## Branch Protection Rules

### `main` branch
- Require PR with 1 approval
- Require status checks (CI, tests)
- Require branches to be up to date
- No direct pushes
- Include administrators

### `staging` branch
- Require PR with 1 approval
- Require status checks (CI, tests)
- Allow squash merging only
