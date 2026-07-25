import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ModelContextTool } from '@tehw0lf/wordlist-generator/webmcp';

import { WebmcpService } from './webmcp.service';

interface Registration {
  tool: ModelContextTool<never>;
  signal: AbortSignal;
}

/**
 * Stands in for document.modelContext. Tracks which tools are still live so a
 * test can distinguish "registered then aborted" from "never registered".
 */
class ModelContextMock {
  registrations: Registration[] = [];
  /** Resolvers for pending registerTool calls, so a test can order them. */
  private pending: (() => void)[] = [];

  registerTool(
    tool: ModelContextTool<never>,
    options?: { signal?: AbortSignal }
  ): Promise<void> {
    const signal = options?.signal ?? new AbortController().signal;
    return new Promise<void>((resolve) => {
      this.pending.push(() => {
        this.registrations.push({ tool, signal });
        resolve();
      });
    });
  }

  /** Completes the registrations queued so far, oldest first. */
  flush(): void {
    const queued = this.pending;
    this.pending = [];
    queued.forEach((resolve) => resolve());
  }

  /** Completes the most recently queued registrations first. */
  flushNewestFirst(): void {
    const queued = this.pending.reverse();
    this.pending = [];
    queued.forEach((resolve) => resolve());
  }

  liveToolNames(): string[] {
    return this.registrations
      .filter((registration) => !registration.signal.aborted)
      .map((registration) => registration.tool.name)
      .sort();
  }
}

describe('WebmcpService', () => {
  let service: WebmcpService;
  let mock: ModelContextMock;

  const routeTool = (name: string): ModelContextTool<never> =>
    ({
      name,
      description: name,
      inputSchema: { type: 'object', properties: {} },
      execute: async () => ({})
    }) as unknown as ModelContextTool<never>;

  beforeEach(() => {
    mock = new ModelContextMock();
    (document as unknown as { modelContext?: unknown }).modelContext = mock;

    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    service = TestBed.inject(WebmcpService);
  });

  afterEach(() => {
    delete (document as unknown as { modelContext?: unknown }).modelContext;
  });

  it('should register the site tools', async () => {
    const registered = service.register();
    mock.flush();
    await registered;

    expect(mock.liveToolNames()).toEqual(['list_apps', 'navigate_to_app']);
  });

  it('should replace route tools instead of accumulating them', async () => {
    const first = service.register([routeTool('route_a')]);
    mock.flush();
    await first;

    const second = service.register([routeTool('route_b')]);
    mock.flush();
    await second;

    expect(mock.liveToolNames()).toEqual([
      'list_apps',
      'navigate_to_app',
      'route_b'
    ]);
  });

  it('should not leak the previous route tools when registrations resolve out of order', async () => {
    // Navigating away calls register() with no route tools while the next
    // component's register() is already in flight. Callers never await these,
    // so the stale one can resolve last.
    const stale = service.register();
    const current = service.register([routeTool('route_b')]);

    mock.flushNewestFirst();
    await Promise.all([stale, current]);

    expect(mock.liveToolNames()).toEqual([
      'list_apps',
      'navigate_to_app',
      'route_b'
    ]);
  });

  it('should drop everything on clear, including an in-flight registration', async () => {
    const inFlight = service.register([routeTool('route_a')]);
    service.clear();
    mock.flush();
    await inFlight;

    expect(mock.liveToolNames()).toEqual([]);
  });
});
