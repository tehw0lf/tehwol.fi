# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is an Nx monorepo containing an Angular portfolio website and reusable Angular libraries. The main application `tehwolfde` showcases three custom libraries published under the `@tehw0lf` namespace:

- **git-portfolio**: Customizable Git repository portfolio supporting GitHub/GitLab
- **wordlist-generator**: Cartesian product-based wordlist generator 
- **contact-form**: Flexible contact form using ngx-formly

### Monorepo Structure
- `apps/tehwolfde/`: Main Angular application (portfolio website)
- `apps/tehwolfde-e2e/`: E2E tests using Cypress
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

## Angular Guidelines

Follow the Angular documentation at https://angular.dev for best practices. Key conventions:
- Component prefix: `tehw0lf`
- Styling: SCSS with Angular Material (purple-green theme)
- Testing: Jest for unit tests, Cypress for E2E
- Libraries use ng-packagr for building and publishing

## Library Development

Each library in `libs/` is independently publishable with its own:
- `package.json` with version and dependencies
- `project.json` with build/test/lint targets
- TypeScript configs for library and production builds
- Jest configuration for testing

When working on libraries, test integration with the main app by importing via the path mapping.