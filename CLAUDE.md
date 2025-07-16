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

## Pre-commit Validation Commands

**IMPORTANT**: Before committing any changes, always run these validation commands. Never commit changes that do not pass both commands with an exit code of 0.

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

## Important Instructions

**IMPORTANT**: Act as a critical code reviewer. Question approaches, ask clarifying questions about requirements, suggest alternative solutions, and identify potential issues (performance, security, maintainability, edge cases) before implementing.

**IMPORTANT**: Always validate that code works before committing. Never commit code that does not pass linting, testing, building, or end-to-end testing.

**IMPORTANT**: Check the `.gitignore` file and ensure sensitive files are not committed.

**IMPORTANT**: Prefer editing existing files over creating new ones unless absolutely necessary for the goal.

**IMPORTANT**: Never proactively create documentation files (*.md) or README files unless explicitly requested.

## MCP Server Integration

**IMPORTANT**: When working with this project, utilize MCP servers to get the latest best practices and documentation.

### Context7 for Latest Documentation
Use the Context7 MCP server to retrieve up-to-date documentation for Angular, Nx, and other libraries used in this project:

```bash
# Example usage for getting Angular best practices
- Use Context7 to get latest Angular documentation
- Use Context7 to get latest Nx monorepo patterns
- Use Context7 to get latest Jest testing practices
- Use Context7 to get latest Playwright E2E testing patterns
- Use Context7 to get latest Angular Material implementation guidance
```

### Available MCP Servers
- **Context7**: For retrieving latest library documentation and best practices
- **Memory**: For maintaining context about project decisions and patterns
- **Sequential-thinking**: For complex architectural decisions and problem-solving
- **Nx MCP Server**: For Nx-specific workspace management, generation, and task execution

### Nx MCP Server Integration
**IMPORTANT**: This workspace includes Nx MCP server integration. Refer to [`.github/instructions/nx.instructions.md`](.github/instructions/nx.instructions.md) for comprehensive Nx-specific guidelines including:
- Workspace analysis and project graph visualization
- Code generation workflows
- Task execution and debugging
- CI error troubleshooting

The Nx MCP server provides tools for workspace management, generator execution, and task monitoring that are specifically tailored to this Nx 21.2.2 monorepo.

### When to Use MCP Servers
- Before implementing new features, consult Context7 for latest best practices
- When updating dependencies, check Context7 for migration patterns
- For complex architectural decisions, use sequential-thinking MCP server
- Store important project decisions and patterns in memory MCP server

**IMPORTANT**: Always prefer latest documentation from Context7 over potentially outdated local knowledge when implementing Angular, Nx, Jest, or Playwright features.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
