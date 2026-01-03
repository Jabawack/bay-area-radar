# Software Engineering Principles

> Reference file for frontend-dev-guidelines - Detailed coverage of DRY, SOLID, KISS, and YAGNI principles adapted for React/TypeScript development.

## Table of Contents

- [DRY (Don't Repeat Yourself)](#dry-dont-repeat-yourself)
- [SOLID Principles](#solid-principles-adapted-for-react)
  - [Single Responsibility (SRP)](#s---single-responsibility)
  - [Open/Closed (OCP)](#o---openclosed)
  - [Liskov Substitution (LSP)](#l---liskov-substitution)
  - [Interface Segregation (ISP)](#i---interface-segregation)
  - [Dependency Inversion (DIP)](#d---dependency-inversion)
- [KISS (Keep It Simple, Stupid)](#kiss-keep-it-simple-stupid)
- [YAGNI (You Aren't Gonna Need It)](#yagni-you-arent-gonna-need-it)
- [Quick Reference Table](#quick-reference-principles-applied)
- [Anti-Patterns to Avoid](#anti-patterns-to-avoid)

---

## DRY (Don't Repeat Yourself)

**Rule**: Every piece of knowledge should have a single, unambiguous representation.

```typescript
// BAD - Repeated logic
const UserCard = ({ user }) => (
  <div>{user.firstName} {user.lastName}</div>
);
const UserProfile = ({ user }) => (
  <h1>{user.firstName} {user.lastName}</h1>
);

// GOOD - Single source of truth
const formatFullName = (user: User) => `${user.firstName} ${user.lastName}`;

const UserCard = ({ user }) => <div>{formatFullName(user)}</div>;
const UserProfile = ({ user }) => <h1>{formatFullName(user)}</h1>;
```

**Apply to:**
- Shared utilities → `helpers/` or `lib/`
- Shared types → `types/`
- Shared components → `components/`
- API calls → `api/{feature}Api.ts`
- Constants → `constants.ts`

---

## SOLID Principles (Adapted for React)

### S - Single Responsibility

Each component/hook should do ONE thing well.

```typescript
// BAD - Component does too much
const UserDashboard = () => {
  // Fetches data, handles auth, renders UI, manages state...
};

// GOOD - Separated concerns
const useUserData = () => { /* data fetching */ };
const useAuth = () => { /* auth logic */ };
const UserDashboard = () => { /* just renders UI */ };
```

### O - Open/Closed

Components should be open for extension, closed for modification.

```typescript
// GOOD - Extensible via props/composition
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  children: React.ReactNode;
}
```

### L - Liskov Substitution

Child components should be substitutable for parent abstractions.

```typescript
// GOOD - Any Button variant works the same way
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
```

### I - Interface Segregation

Don't force components to depend on props they don't use.

```typescript
// BAD - Too many required props
interface CardProps {
  title: string;
  subtitle: string;
  image: string;
  actions: Action[];
  footer: ReactNode;
}

// GOOD - Only require what's needed
interface CardProps {
  title: string;
  children: ReactNode;
  subtitle?: string;
  image?: string;
}
```

### D - Dependency Inversion

Depend on abstractions (hooks, context), not concrete implementations.

```typescript
// GOOD - Component depends on hook abstraction
const MyComponent = () => {
  const { data, isLoading } = useData(); // abstraction
  // Not: const data = await fetch('/api/data'); // concrete
};
```

---

## KISS (Keep It Simple, Stupid)

**Rule**: The simplest solution is usually the best.

```typescript
// BAD - Over-engineered
const isEven = (n: number): boolean => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(n % 2 === 0), 0);
  }).then(result => result);
};

// GOOD - Simple and direct
const isEven = (n: number): boolean => n % 2 === 0;
```

**React Examples:**

```typescript
// BAD - Unnecessary abstraction
const useToggle = () => {
  const [state, setState] = useState(false);
  const toggle = useCallback(() => setState(s => !s), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  return { state, toggle, setTrue, setFalse };
};

// GOOD - Just use useState directly for simple cases
const [isOpen, setIsOpen] = useState(false);
```

**Checklist:**
- Can a junior developer understand this in 5 minutes?
- Is this abstraction actually needed?
- Am I solving a problem that doesn't exist yet?

---

## YAGNI (You Aren't Gonna Need It)

**Rule**: Don't build features until they're actually needed.

```typescript
// BAD - Building for hypothetical future
interface UserCardProps {
  user: User;
  showAvatar?: boolean;
  showBio?: boolean;
  showStats?: boolean;
  showFollowers?: boolean;
  showFollowing?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact' | 'expanded';
  theme?: 'light' | 'dark' | 'system';
  // 20 more options "just in case"...
}

// GOOD - Build what you need NOW
interface UserCardProps {
  user: User;
  showAvatar?: boolean;
}
```

**YAGNI Violations:**
- Adding config options "for flexibility"
- Creating abstractions before the second use case
- Building admin features before launch
- Supporting edge cases that don't exist yet

**Rule of Three**: Don't abstract until you've seen the pattern THREE times.

---

## Quick Reference: Principles Applied

| Situation | Principle | Action |
|-----------|-----------|--------|
| Same code in 2+ places | DRY | Extract to helper/component |
| Component doing too much | SRP (SOLID) | Split into smaller components |
| Adding "just in case" feature | YAGNI | Delete it, add when needed |
| Complex solution for simple problem | KISS | Simplify |
| Passing unused props | ISP (SOLID) | Make props optional or remove |
| Hardcoding dependencies | DIP (SOLID) | Use hooks/context |

---

## Anti-Patterns to Avoid

```typescript
// Premature optimization
const MemoizedEverything = React.memo(({ simple }) => <div>{simple}</div>);

// Prop drilling "just in case"
<App theme={theme} user={user} settings={settings} config={config} />

// God components
const Dashboard = () => { /* 500+ lines */ };

// Abstracting too early
const useGenericDataFetcher = () => { /* used once */ };

// START SIMPLE, refactor when needed
const Dashboard = () => { /* does one thing */ };
```

---

**Back to main guide:** [../SKILL.md](../SKILL.md)
