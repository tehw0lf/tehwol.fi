import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  ModelContextTool,
  registerModelContextTools
} from '@tehw0lf/wordlist-generator/webmcp';

import { EMBEDDED_APPS } from '../embeds/apps';

/**
 * Registers the site level WebMCP tools and owns the lifetime of every tool
 * registration on this page.
 *
 * The ModelContext helpers are re-used from one library rather than duplicated
 * here; they are identical across the published packages.
 */
@Injectable({ providedIn: 'root' })
export class WebmcpService {
  private router = inject(Router);
  private unregister: (() => void) | undefined;

  /** Tools describing the site itself, independent of the current route. */
  private siteTools(): readonly ModelContextTool<never>[] {
    const listApps: ModelContextTool<Record<string, never>> = {
      name: 'list_apps',
      title: 'List embedded apps',
      description:
        'Lists the apps embedded on tehwolf.de with their route and external url.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => ({
        apps: EMBEDDED_APPS.map((app) => ({
          slug: app.slug,
          title: app.title,
          url: app.url,
          route: `/${app.slug}`
        }))
      })
    };

    const navigate: ModelContextTool<{ slug: string }> = {
      name: 'navigate_to_app',
      title: 'Open an embedded app',
      description:
        'Navigates this page to one of the embedded apps. Call list_apps first to learn the valid slugs.',
      inputSchema: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            enum: EMBEDDED_APPS.map((app) => app.slug),
            description: 'Slug of the app to open.'
          }
        },
        required: ['slug']
      },
      annotations: { readOnlyHint: false },
      execute: async ({ slug }) => {
        const app = EMBEDDED_APPS.find((entry) => entry.slug === slug);
        if (!app) {
          throw new Error(
            `unknown app "${slug}", valid slugs: ${EMBEDDED_APPS.map((a) => a.slug).join(', ')}`
          );
        }

        const navigated = await this.router.navigate([`/${app.slug}`]);

        return { navigated, route: `/${app.slug}`, title: app.title };
      }
    };

    return [
      listApps as unknown as ModelContextTool<never>,
      navigate as unknown as ModelContextTool<never>
    ];
  }

  /**
   * Registers the site tools plus any additional tools contributed by the
   * currently rendered showcase. Calling it again replaces the previous
   * registration, so route specific tools do not accumulate.
   */
  async register(
    additionalTools: readonly ModelContextTool<never>[] = []
  ): Promise<void> {
    this.unregister?.();
    this.unregister = await registerModelContextTools([
      ...this.siteTools(),
      ...additionalTools
    ]);
  }

  /** Removes every tool this service registered. */
  clear(): void {
    this.unregister?.();
    this.unregister = undefined;
  }
}
