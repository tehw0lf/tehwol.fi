import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
});

// jsdom does not implement IntersectionObserver (required by @defer on viewport)
globalThis.IntersectionObserver = class {
  observe(): void { return; }
  unobserve(): void { return; }
  disconnect(): void { return; }
} as unknown as typeof IntersectionObserver;
