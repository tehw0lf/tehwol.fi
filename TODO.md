# TODO

Known work that is deliberately not done yet. Each entry says what the problem
is, why it was left, and what doing it would involve — so picking one up does
not start with re-deriving the context.

Counts and line numbers were verified against `main` at version 22.1.25
(commit `08927f1`). Re-check them before acting; they drift as the code moves.

---

## 1. Migrate the off-grid spacing values onto the 4px scale

**Status:** open · **Effort:** small, but needs visual review · **Risk:** changes rendered layout

`--tw-space-*` is a 4px scale (`_tokens.scss`). Sixteen off-grid values remain,
across fourteen declarations — two shorthands carry `10px` twice. They were left
alone when the scale was introduced in #337, because rounding them changes what
ships.

| Value  | Count | Where                                  |
| ------ | ----- | -------------------------------------- |
| `10px` | 15    | see below                              |
| `15px` | 1     | `wordlist-generator.component.scss:34` |

Full list:

```
apps/tehwolfde/src/app/i18n/language-switcher.component.scss:19      padding: 0 10px
apps/tehwolfde/src/app/components/nav/mobile/mobile.component.scss:8 margin: 0 10px 0 0
apps/tehwolfde/src/app/components/nav/desktop/desktop.component.scss:9  margin: 0 10px 0 0
libs/wordlist-generator/…/wordlist-generator.component.scss:22       margin-right: 10px
libs/wordlist-generator/…/wordlist-generator.component.scss:26       margin: 0 10px
libs/wordlist-generator/…/wordlist-generator.component.scss:30       margin-right: 10px
libs/wordlist-generator/…/wordlist-generator.component.scss:34       margin-bottom: 15px
libs/wordlist-generator/…/wordlist-generator.component.scss:49       margin: 0 10px 10px 0
libs/wordlist-generator/…/wordlist-generator.component.scss:55       margin: 0 10px 10px 0
libs/wordlist-generator/…/wordlist-generator.component.scss:62       margin: 0 0 10px 0
libs/wordlist-generator/…/wordlist-generator.component.scss:134      margin-bottom: 10px
libs/git-portfolio/…/repo-card.component.scss:18                     margin: 0 10px 0 0
libs/git-portfolio/…/repo-card.component.scss:78                     margin: 0 -16px -10px -16px
libs/git-portfolio/…/repo-card.component.scss:80                     padding-bottom: 10px
```

**Do not touch these** — they look like matches but are not spacing:

- `desktop.component.scss:28` and `:33` — `backdrop-filter: blur(15px)`. A blur
  radius has nothing to do with the spacing grid.
- `repo-card.component.scss:78` — the `-10px` is a _negative_ margin pulling a
  footer flush. Rounding it to `-12px` moves the element; decide deliberately.

**Approach:** `10px → var(--tw-space-3)` (12px) or `var(--tw-space-2)` (8px)
per case, whichever the layout actually wants — not a blind find-and-replace.
Two of the three files are publishable libraries, so the change ships to
consumers. Wants a visual check per component, not just green tests.

---

## 2. No drift guard on the published design system

**Status:** open · **Effort:** medium · **Risk:** low

`_tokens.scss` is the single source of truth. The repo protects it:
`npm run style-guide:check` regenerates `tools/style-guide/brand-tokens.html`
and fails `nx affected:lint` when the committed guide no longer matches.

The design-system project on claude.ai/design has no equivalent. Its
`tokens.css` is a hand-copied mirror, so a token change in the repo leaves it
silently stale. Nothing fails; the published sheets just start lying.

**Approach:** generate `tokens.css` from `_tokens.scss` the way the style guide
is generated, and add it to the same check. The upload itself stays manual — CI
has no access to the design project — but at least the generated file would be
verifiably current before anyone uploads it.

**Note:** the sheets bind tokens to `:root` and to both theme states, whereas
the app uses `body.dark` / `body.light`. A generator has to do that transform,
so it is not a straight copy of the file.

---

## 3. Consider self-hosting a monospace face — only if something needs one

**Status:** open, low priority · **Effort:** small

`--tw-font-mono` was removed in #338: it named Roboto Mono, which the app
neither hosts nor uses, and nothing in the repo consumed it. The site sets no
code or tabular text, so there is no brand mono face by design.

If that changes — a code block, a table of figures, anything that wants fixed
advance widths — the face has to be **self-hosted**. The app's CSP sets
`font-src 'self'` (`security-headers.conf`), so a Google Fonts link is blocked,
not merely slow. That CSP was tightened deliberately in #281 in response to DAST
findings; do not loosen it for a font.

**Approach:** mirror what #281 did for Roboto — woff2 for latin and latin-ext
into `apps/tehwolfde/src/assets/fonts/`, `@font-face` blocks in `fonts.scss`,
and the Apache 2.0 `LICENSE.txt` alongside, as the existing font folders have.
Roboto Mono is a variable font, so weights 400 and 500 share one file: two
files, not four.

Until then, the design-system sheets hold their own `--ds-mono`, which is sheet
chrome rather than a brand token.
