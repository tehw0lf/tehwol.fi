# Angular Copilot Instructions

> This file references the latest shared Angular guidelines and resources.
>
> - [copilot-instructions.md (Angular Guidelines)](https://angular.dev/assets/context/guidelines.md)
> - [llms.txt (Angular Reference)](https://angular.dev/llms.txt)
> - [llms-full.txt (Full Angular Reference)](https://angular.dev/llms-full.txt)

For the most current best practices, always refer to the above links. You can reuse these files in all your Angular apps by referencing these URLs.


# tehw0lf Monorepo Copilot Instructions

## Core Commands

- **Build:** `nx build`
- **Serve:** `nx serve`
- **Test:** `nx test` (single test: `nx test <project> --testNamePattern="..."`)
- **Lint:** `nx lint`
- **E2E:** `nx e2e tehwolfde-e2e`
- **Format:** `nx format:write` / `nx format:check`
- **Migrate:** `nx migrate latest`
- **Dep Graph:** `nx dep-graph`
- **Affected:** `nx affected:<target>`

## High-Level Architecture

- **Monorepo managed by Nx**: Contains Angular app (`apps/tehwolfde`) and libraries (`libs/`).
- **Major Libraries:**
  - `@tehw0lf/git-portfolio`: Angular component for displaying GitHub/GitLab repos, fetches via public APIs.
  - `@tehw0lf/wordlist-generator`: Angular component/service for generating wordlists using cartesian product.
  - `@tehw0lf/contact-form`: Angular component for flexible contact forms (uses ngx-formly).
- **App Structure:**
  - `apps/tehwolfde`: Main portfolio site, imports above libraries as features.
  - Routing: `/portfolio`, `/wordlist-generator`, `/contact-form`, `/home`.
- **Services:**
  - `ThemeService`: Manages light/dark theme, updates body class.
  - `GitProviderService`: Fetches and sorts repositories from GitHub/GitLab APIs.
  - `WordlistGeneratorService`: Generates wordlists from charsets.
- **No backend or database**: All data is fetched from public APIs or generated client-side.

## Style & Formatting Rules

- **Linting:** Enforced by ESLint (`eslint.config.mjs`), including:
  - No extra semicolons (`no-extra-semi`)
  - No deprecated TypeScript APIs (`@typescript-eslint/no-deprecated`)
  - Enforce Nx module boundaries
- **Formatting:** Use Prettier (`prettier` config in devDependencies).
- **TypeScript:**
  - Prefer explicit types, especially for public APIs.
  - Use Angular's `signal` and `inject` patterns where possible.
  - Use `input()` for component inputs (Angular v17+).
- **Naming:**
  - Components: `PascalCaseComponent`
  - Services: `PascalCaseService`
  - Enums: `PascalCase`
  - Variables: `camelCase`
- **Error Handling:**
  - Minimal, as most services are wrappers for public APIs or pure functions.
  - Use RxJS for async flows; return empty arrays/observables on error.
- **Imports:**
  - Use path aliases as defined in `tsconfig.base.json` (`@tehw0lf/*`).
  - Group Angular, third-party, and local imports.

## Agent Rules

- Always reference the latest Angular guidelines (see links above).
- Do not overwrite this file; always merge/patch.
- Summarize, do not copy, README or other docs.
- Be concise; avoid boilerplate and exhaustive file listings.
- Only cite facts found in the repo.
