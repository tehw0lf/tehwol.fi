/**
 * Single source of truth for the embedded apps.
 *
 * Consumed by the routes, both navigation variants and the home page carousel,
 * so a new app only has to be added here.
 */
export interface EmbeddedApp {
  /** Route path segment. */
  slug: string;
  /** Display name, used in navigation, carousel and iframe title. */
  title: string;
  /** External URL rendered inside the embed iframe and its carousel preview. */
  url: string;
  /**
   * Apps that need more than a plain iframe (own controls, dynamic url) keep a
   * hand written route and component, but still appear in navigation and the
   * carousel. Only apps without this flag get a generated embed route.
   */
  hasCustomRoute?: boolean;
}

export const EMBEDDED_APPS: readonly EmbeddedApp[] = [
  {
    slug: 'flowdive',
    title: 'Flowdive',
    url: 'https://flowdive.tehwolf.de'
  },
  {
    slug: 'numveil',
    title: 'Numveil',
    url: 'https://numveil.tehwolf.de'
  },
  {
    slug: 'beep',
    title: 'Beep Simulator',
    url: 'https://tehw0lf.github.io/beep/'
  },
  {
    slug: 'btrain',
    title: 'BTrain',
    url: 'https://btrain.tehwolf.de'
  },
  {
    slug: 'mutuals',
    title: 'Mutuals',
    url: 'https://tehw0lf.github.io/mutuals/'
  },
  {
    slug: 'wowquote2-manager',
    title: 'WoWQuote2 Manager',
    url: 'https://tehw0lf.github.io/WoWQuote2-Manager/'
  },
  {
    slug: 'color',
    title: 'Color',
    url: 'https://color.tehwolf.de',
    hasCustomRoute: true
  },
  {
    slug: 'farbduell',
    title: 'Farbduell',
    url: 'https://farbduell.tehwolf.de'
  }
] as const;
