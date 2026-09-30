# Contributing to Sightline

Thank you for your interest in contributing to Sightline! This document outlines guidelines and instructions for submitting contributions, reporting issues, and developing features.

---

## Code of Conduct & Principles

Sightline is built with high standards of security, privacy, and architectural clarity:
- **Calm, Honest Interface**: Keep all copy plain and factual. Avoid marketing hype or exclamation marks in UI notifications.
- **Zero Client-Side Secrets**: Never commit or expose API keys (such as `GEMINI_API_KEY`) to client-side code. All AI operations are proxied through authenticated server routes.
- **Deterministic Evaluation**: Brand detection must remain strictly deterministic. Never delegate detection accuracy to an LLM.
- **Performance First**: Lazy-load routes and heavy visualization modules. Maintain 60fps rendering and fast cold starts.

---

## Development Workflow

### 1. Prerequisites
- Node.js version 20 or higher
- Git
- Access to a Firebase project with Firestore and Authentication enabled

### 2. Getting Started
```bash
# Fork the repository and clone your fork
git clone https://github.com/your-username/sightline.git
cd sightline

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env

# Start dev server
npm run dev
```

### 3. Running Tests
Before submitting a pull request, verify that all unit tests pass:
```bash
npm test
```

To type-check the codebase:
```bash
npm run lint
```

---

## Architectural Guidelines

1. **Frontend**:
   - Built on React 19 and Tailwind CSS.
   - Use CSS variables for theme-aware tokens (`bg-background`, `border-border`, `text-foreground`).
   - Use tabular numbers (`tabular-nums`) for numeric data display.
   - Ensure all interactive elements have visible `:focus-visible` styling and accessible tap targets (minimum 44x44px).

2. **Backend**:
   - All server endpoints reside in `server/routes/api.ts`.
   - All protected routes must apply `requireAuth` and appropriate `requireWorkspaceRole` middleware.
   - Run endpoints must be rate-limited using `server/middleware/rate-limit.ts`.
   - Pure business logic (metrics calculation, mention detection, scheduling) should be isolated in pure utility functions to allow zero-mock unit testing.

3. **Database Security Rules**:
   - Any modifications to `firestore.rules` must adhere to the Role-Based Access Control matrix documented in `docs/RULES_TEST_PLAN.md`.
   - The server Admin SDK is the sole authority permitted to write to `/runs` and `/reports`.

---

## Pull Request Guidelines

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Write clean, self-documenting code with meaningful commit messages.
3. If introducing new pure algorithms, add corresponding unit tests in `tests/`.
4. Ensure `npm test` and `npm run lint` succeed with zero errors.
5. Submit your PR with a clear summary of changes, problem addressed, and screenshots if modifying UI.

Thank you for helping make Sightline better!
