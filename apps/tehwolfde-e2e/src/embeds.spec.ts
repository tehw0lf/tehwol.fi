import { expect, test } from '@playwright/test';

/**
 * Mirrors EMBEDDED_APPS. Kept as a literal so a mistake in the app's own list
 * cannot make these assertions pass by accident.
 */
const embeds = [
  { slug: 'flowdive', title: 'Flowdive', url: 'https://flowdive.tehwolf.de' },
  { slug: 'numveil', title: 'Numveil', url: 'https://numveil.tehwolf.de' },
  {
    slug: 'beep',
    title: 'Beep Simulator',
    url: 'https://tehw0lf.github.io/beep/'
  },
  { slug: 'btrain', title: 'BTrain', url: 'https://btrain.tehwolf.de' },
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
    slug: 'farbduell',
    title: 'Farbduell',
    url: 'https://farbduell.tehwolf.de'
  }
];

test.describe('Embedded app routes', () => {
  for (const embed of embeds) {
    test(`should embed ${embed.title} with its external url`, async ({
      page
    }) => {
      await page.goto(`/${embed.slug}`);

      const frame = page.locator('iframe.embed-frame');
      await expect(frame).toBeAttached();
      await expect(frame).toHaveAttribute('src', embed.url);
      await expect(frame).toHaveAttribute('title', embed.title);

      // The toolbar must offer the same target for opening in a new tab.
      await expect(page.locator('.embed-toolbar a')).toHaveAttribute(
        'href',
        embed.url
      );
    });
  }

  test('should keep the color embed on its own dynamic url', async ({
    page
  }) => {
    await page.goto('/color/red');

    await expect(page.locator('iframe.embed-frame')).toHaveAttribute(
      'src',
      /color\.tehwolf\.de/
    );
  });
});

test.describe('Home app carousel', () => {
  test('should preview external apps rather than the site itself', async ({
    page
  }) => {
    await page.goto('/home');

    const slides = page.locator('.carousel-slide');
    await expect(slides).toHaveCount(embeds.length + 1); // + color

    // Previews mount after the page goes idle.
    const preview = page.locator('.carousel-slide iframe').first();
    await expect(preview).toBeAttached({ timeout: 10000 });

    const src = await preview.getAttribute('src');
    expect(src).toMatch(/^https?:\/\//);
    // A relative '/slug' here would mean the site embeds itself recursively.
    expect(src).not.toMatch(/^\//);
  });

  test('should advance slides with the next control', async ({ page }) => {
    await page.goto('/home');

    const track = page.locator('.carousel-track');
    const before = await track.evaluate((el) => el.scrollLeft);

    await page.getByRole('button', { name: 'Next app' }).click();
    await page.waitForTimeout(800);

    expect(await track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(before);
  });
});
