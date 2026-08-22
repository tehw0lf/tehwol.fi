# CLAUDE.md

This file provides project-specific guidance to Claude Code for this repository.

## Architecture Overview

This is an Nx monorepo containing an Angular portfolio website and reusable Angular libraries. The main application `tehwolfde` showcases three custom libraries published under the `@tehw0lf` namespace:

- **git-portfolio**: Customizable Git repository portfolio supporting GitHub/GitLab
- **wordlist-generator**: Cartesian product-based wordlist generator 
- **contact-form**: Flexible contact form using ngx-formly

### Monorepo Structure
- `apps/tehwolfde/`: Main Angular application (portfolio website)
- `apps/tehwolfde-e2e/`: E2E tests using Playwright
- `libs/*/`: Publishable Angular libraries with independent versioning
- Path mapping in `tsconfig.base.json` allows importing libs as `@tehw0lf/library-name`

## Commands

### Development
```bash
npm start                    # Serve the main application
nx serve tehwolfde          # Alternative serve command
nx serve tehwolfde --port 4200  # Serve on specific port
```

### Building
```bash
npm run build               # Build main application
nx build tehwolfde         # Build specific application
nx build git-portfolio     # Build specific library
```

### Testing
```bash
npm test                   # Run all tests with --detect-open-handles
nx test tehwolfde         # Test specific project
nx test git-portfolio     # Test specific library
```

### Linting & Formatting
```bash
npm run lint              # Lint all projects
nx lint tehwolfde        # Lint specific project
npm run format           # Format all files
```

### E2E Testing
```bash
npm run e2e              # Run E2E tests
nx e2e tehwolfde-e2e    # Alternative E2E command
```

### Nx-specific Commands
```bash
nx affected:build        # Build only affected projects
nx affected:test        # Test only affected projects
nx affected:lint        # Lint only affected projects
nx dep-graph           # View dependency graph
```

## Project-specific conventions
- Component prefix: `tehw0lf`
- Styling: SCSS with Angular Material (purple-green theme)
- Testing: Jest for unit tests, Playwright for E2E
- Libraries use ng-packagr for building and publishing

## Library Development

Each library in `libs/` is independently publishable with its own:
- `package.json` with version and dependencies
- `project.json` with build/test/lint targets
- TypeScript configs for library and production builds
- Jest configuration for testing

When working on libraries, test integration with the main app by importing via the path mapping.

## Design Tokens

All brand colours live in `apps/tehwolfde/src/assets/styles/_tokens.scss` as CSS
custom properties, defined per theme under `body.dark` and `body.light`. It is the
single source of truth — never hardcode a colour, and never put one in a Sass
variable: Sass compiles to one fixed value and cannot follow the theme.

The publishable libraries reference tokens as `var(--tw-accent, #cc7832)`. Keep the
fallback (the dark value) so consumers without tokens render unchanged.

Two rules that are easy to get wrong:
- Controls use `--tw-control-text`, not `--tw-accent`. The accent is tuned for the
  page ground and only reaches 3.79:1 on the control surface.
- Measure contrast against the surface a colour actually sits on, not against the page.

**The style guide is generated, not written.** After changing `_tokens.scss`, run:

```bash
npm run style-guide          # regenerate tools/style-guide/brand-tokens.html
npm run style-guide:check    # fails if the guide is stale
```

The check runs ahead of `nx affected:lint`, so CI fails on a token change whose
guide was never regenerated. Commit the regenerated HTML alongside the tokens.

Republishing the guide to its Artifact is manual — CI has no access to it. After
a token change, regenerate, commit, and republish to the same URL so the shared
link stays current.

## Version Bump Requirement

**IMPORTANT**: Every PR in this repository **must** include a version bump in `package.json`. CI uses the version tag for Docker artifact naming via `nx affected`. Without a bump, the security scan step fails because it cannot find a uniquely tagged artifact.

Steps required on every PR branch:
1. Bump the `version` field in `package.json` (patch increment unless the change warrants minor/major)
2. Run `npm install` immediately after to update `package-lock.json`
3. Commit both `package.json` and `package-lock.json` together
4. Never open a PR without this — CI will fail at the security scan step

## Pre-commit Validation Commands

The workspace rule — never commit what does not pass — applies here; these are
this repository's concrete commands for it.

### Primary Validation
```bash
npm run lint && npm run test && npm run build
```

### E2E Validation
```bash
npm run e2e
```

### Alternative Nx-specific Validation
```bash
npx nx run-many -t lint,test,build
npm run e2e
```

## Project-specific Instructions

Rules that apply to every repository — critical review, pre-commit validation,
`.gitignore` hygiene, feature-branch workflow — live in the global and workspace
`CLAUDE.md` and are not repeated here.

### Nx MCP server

This workspace has the Nx MCP server available. Use it for project-graph
inspection, generator runs, and task/CI troubleshooting instead of guessing at
workspace layout.

### Documentation lookups

Angular, Nx, Jest, Playwright and Angular Material move fast. Prefer Context7
over recalled knowledge when implementing against them, and check it for
migration notes when bumping those dependencies.
