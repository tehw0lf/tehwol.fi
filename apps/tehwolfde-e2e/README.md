# E2E Testing with Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Running Tests

```bash
# Run all E2E tests
npm run e2e

# Run tests in headed mode (see browser)
nx e2e tehwolfde-e2e --headed

# Run tests for CI
nx e2e-ci tehwolfde-e2e

# Run specific test file
npx playwright test src/home.spec.ts

# Run tests in debug mode
npx playwright test --debug
```

## Test Structure

- `src/home.spec.ts` - Tests for the home page and basic functionality
- `src/navigation.spec.ts` - Tests for navigation and routing
- `src/git-portfolio.spec.ts` - Tests for the Git portfolio component
- `src/wordlist-generator.spec.ts` - Tests for the wordlist generator
- `src/contact-form.spec.ts` - Tests for the contact form

## Browser Configuration

Tests run on:
- Chromium (Desktop)
- Firefox (Desktop) 
- WebKit/Safari (Desktop)

Mobile browsers can be enabled by uncommenting the mobile configurations in `playwright.config.ts`.

## Debugging Tests

1. Run with `--debug` flag: `npx playwright test --debug`
2. Use VS Code Playwright extension for better debugging experience
3. Generate test reports: `npx playwright show-report`

## Writing Tests

All tests should follow these patterns:
- Use descriptive test names
- Test user workflows, not implementation details
- Include accessibility checks where appropriate
- Test responsive behavior on different viewport sizes
- Handle loading states and async operations properly