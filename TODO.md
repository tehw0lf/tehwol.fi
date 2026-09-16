# TODO

Known work that is deliberately not done yet. Each entry says what the problem
is, why it was left, and what doing it would involve — so picking one up does
not start with re-deriving the context.

Counts and line numbers were verified against `main` at version 22.1.27.
Re-check them before acting; they drift as the code moves.

---

## 1. The desktop nav overflows its flex container in German

**Status:** open · **Effort:** small · **Risk:** changes rendered layout

Found while migrating the spacing scale, and the reason one margin was left
off the grid.

`desktop.component.scss` sets `margin: 0 10px 0 0` on the nav links. It is the
last off-grid spacing value in the codebase, and it is **load-bearing by
accident**: raising it to `--tw-space-3` (12px) makes the e2e test
`should not resize the language switcher when the locale changes` fail.

The mechanism, measured in Firefox at 1280px:

- The links sit in a `flex: 1 1 0%` container; the theme toggle, the language
  switcher and the GitHub link follow it in flow.
- The German labels are wider than the English ones — "Wortlisten-Generator"
  against "Wordlist Generator".
- At 10px margins the German row just fits. At 12px it does not, the container
  overflows its flex share, and everything to its right is pushed along.
- The switcher's **width** is unchanged (125.83px in both locales — the fixed
  label box still works). Its **x** moves by 9.93px.

So the switcher fix the test guards is intact; what breaks is that the toolbar
shifts when the locale changes, which is the same class of defect.

**Approach:** stop the link container overflowing, rather than tuning the
margin until it fits. `min-width: 0` on the flex child is the usual fix for a
flex item refusing to shrink below its content; check it against the longest
locale, not English. Once the row can shrink, migrate the margin to
`--tw-space-3` and drop the explanatory comment in the stylesheet.

**Verify with:**

```bash
npx nx e2e tehwolfde-e2e -- --project=firefox \
  --grep "resize the language switcher"
```

---

## 2. Off-grid spacing migration — done except the entry above

**Status:** done in 22.1.27, one value deliberately left

Every spacing value in the app and the libraries now sits on the 4px scale.
Sixteen values across fourteen declarations were migrated; the one exception is
the desktop nav margin in entry 1.

Notes worth keeping, since a future grep will surface them again:

- `desktop.component.scss` — two `backdrop-filter: blur(15px)`. A blur radius
  is not spacing and must not be migrated.
- `repo-card.component.scss` — the footer's negative bottom margin and its
  bottom padding are a matched pair. They bleed the footer into the card's
  padding and pay the same amount back, so they move together or not at all.
  Both are now `--tw-space-3`, the negative one via `calc(-1 * …)`.
- `.bottom-10` in the wordlist generator was renamed `.bottom-gap`. A class
  named for its value becomes a lie the moment the value moves.

Library SCSS uses the fallback form — `var(--tw-space-3, 12px)` — matching the
`var(--tw-accent, #cc7832)` convention already used in the TypeScript style
inputs, so consumers without the token layer render as the components shipped.

---

## 3. Drift guard on the published design system — done

**Status:** done in 22.1.27

`tools/design-system/build.mjs` generates `tokens.css` from `_tokens.scss` and
`npm run design-tokens:check` fails when the committed file is stale. It runs
alongside `style-guide:check` ahead of `nx affected:lint`.

What it does **not** do: upload. CI has no access to the design project, so
publishing stays manual. The guard guarantees the file in the repo is current —
whoever uploads is uploading the right bytes — not that anybody uploaded.

The generator carries the comments from `_tokens.scss` into the output, because
the file is read as documentation. Two hazards it handles, both found by
testing rather than inspection:

- `@tehw0lf/*` in a comment contains `/*`, which would open a nested CSS
  comment and swallow the rest of the block. Delimiters are neutralised with a
  zero-width space.
- Long values are wrapped across lines by Prettier. Both generators previously
  matched declarations one line at a time and **silently dropped**
  `--tw-font-mono` — the guard reported "up to date" while the token was
  missing from the output. Both parsers now join continuation lines.

The generated file is in `.prettierignore`, for the same reason
`brand-tokens.html` is: the check compares bytes, and the formatter would
rewrite the long font stacks.

---

## 4. Monospace — resolved, no hosted face

**Status:** done in 22.1.27

`--tw-font-mono` exists again, but as a **system stack**, not the Roboto Mono
that was removed in #338. The difference matters: #338 removed a token that
named an unhosted face and that nothing consumed. This one has a consumer.

`<code class="wordlist">` in the wordlist generator sets generated output, which
is scanned column-wise and genuinely wants fixed advance widths. It was already
rendering in the browser's default monospace — unspecified and unbranded.

A hosted face was rejected for two reasons:

1. It would ship a webfont from the publishable libraries to consumers who
   never asked for one.
2. The app's CSP is `font-src 'self'` (`security-headers.conf`), tightened
   deliberately in #281 for DAST findings. A linked face is blocked outright,
   and the CSP must not be loosened for a font.

A system stack needs neither. The design-system sheets now take
`--tw-font-mono` like any other brand token; their old `--ds-mono` is gone.

The style guide keeps its own `--mono`, which loads Roboto Mono from Google
Fonts. That is correct and separate: it is a standalone documentation page
viewed directly in a browser, not served by the app, so the app's CSP does not
apply to it.
