#!/usr/bin/env node
/**
 * Builds the design system's tokens.css from _tokens.scss.
 *
 * The design-system project on claude.ai/design publishes spec sheets that bind
 * the brand tokens. Its stylesheet used to be a hand-copied mirror of
 * _tokens.scss, which made it the one copy of the brand that could drift
 * silently: nothing failed, the published sheets just started lying.
 *
 *   npm run design-tokens          regenerate
 *   npm run design-tokens:check    fail if the committed file is stale
 *
 * Or directly, which is what those scripts call:
 *
 *   node tools/design-system/build.mjs [--out <path>] [--check]
 *
 * --check exits non-zero if the generated output differs from what is on disk,
 * and runs alongside style-guide:check ahead of `nx affected:lint`.
 *
 * WHAT THIS DOES NOT DO
 * Uploading the result to the design project stays manual — CI has no access to
 * it. This guarantees the file in the repo is current, so whoever uploads is
 * uploading the right bytes; it cannot guarantee that someone did upload.
 *
 * THE THEME TRANSFORM
 * The app switches themes with `body.dark` / `body.light`, driven by
 * ThemeService. The published sheets have no such service and follow the
 * viewer instead, so this is not a copy of the file:
 *
 *   body.light  ->  :root                                   (the bare default)
 *   body.dark   ->  @media (prefers-color-scheme: dark)
 *                     :root:not([data-theme='light'])       (viewer preference)
 *               ->  :root[data-theme='dark']                (explicit override)
 *
 * Light is the bare-:root default per the Artifact page contract, and the dark
 * block is emitted twice because a media query cannot be overridden by an
 * attribute selector alone.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const TOKENS = resolve(ROOT, 'apps/tehwolfde/src/assets/styles/_tokens.scss');
const CHROME = resolve(HERE, 'sheet-chrome.css');
const DEFAULT_OUT = resolve(HERE, 'tokens.css');

/* ---------- parsing ------------------------------------------------------ */

/** Pull one `<selector> { … }` block out of the stylesheet. */
function block(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No "${selector}" block in ${TOKENS}`);
  const end = css.indexOf('\n}', start);
  if (end === -1)
    throw new Error(`Unterminated "${selector}" block in ${TOKENS}`);
  return css.slice(start, end);
}

/**
 * The declarations of a block, in source order, with the comments that
 * introduce them.
 *
 * The style guide's parser throws comments away because it renders tokens into
 * tables that carry their own prose. Here the output *is* a stylesheet a human
 * reads, so the reasoning in _tokens.scss has to survive the trip — a token
 * list stripped of why each value is what it is would be worse documentation
 * than the hand-written file this replaces.
 */
function entries(text) {
  const out = [];
  let pending = [];
  let inComment = false;
  let carry = '';

  for (const raw of text.split('\n')) {
    let line = raw.trim();

    // A declaration whose value is long enough gets wrapped across lines by
    // the formatter (--tw-font-mono is), so a line-at-a-time regex would drop
    // it silently — the guard would then pass while the token was missing
    // from the output entirely. Join continuation lines until the semicolon.
    if (carry) {
      carry += ' ' + line;
      if (!line.endsWith(';')) continue;
      line = carry;
      carry = '';
    } else if (
      !inComment &&
      /^--[\w-]+:/.test(line) &&
      !line.split('//')[0].includes(';')
    ) {
      carry = line;
      continue;
    }

    // A /* … */ comment in _tokens.scss routinely spans several lines, and the
    // continuation lines start with a bare word. Tracking the open comment is
    // what keeps the second and third sentences — dropping them silently would
    // strip exactly the warnings worth carrying across.
    if (inComment) {
      pending.push(line);
      if (line.includes('*/')) inComment = false;
      continue;
    }
    if (line.startsWith('/*')) {
      pending.push(line);
      if (!line.includes('*/')) inComment = true;
      continue;
    }
    if (line.startsWith('//')) {
      pending.push(line);
      continue;
    }
    if (line === '') {
      pending = [];
      if (out.length) out[out.length - 1].breakAfter = true;
      continue;
    }

    const m = /^(--[\w-]+):\s*(.+?);/.exec(line.split('//')[0].trim());
    if (m) {
      const trailing = line.includes('//')
        ? line.slice(line.indexOf('//') + 2).trim()
        : null;
      out.push({ name: m[1], value: m[2].trim(), lead: pending, trailing });
      pending = [];
    }
  }
  return out;
}

/* ---------- rendering ---------------------------------------------------- */

/**
 * CSS comments do not nest, so any `/*` or `*\/` inside the text would end the
 * comment early and let the rest of it fall out as broken declarations. The
 * real case here is `@tehw0lf/*`, which the typography note names: a zero-width
 * space between the slash and the star keeps it readable while stopping the
 * tokenizer seeing a delimiter.
 */
const defuse = (s) => s.replace(/\/\*/g, '/​*').replace(/\*\//g, '*​/');

/** Reflow a `//` or `/* *\/` comment from _tokens.scss as CSS. */
function comment(lines, indent) {
  const text = lines
    .map((l) =>
      l
        .replace(/^\/\*+/, '')
        .replace(/\*+\/\s*$/, '')
        .replace(/^\/\//, '')
        .replace(/^\*(?!\/)/, '')
        .trim()
    )
    .filter(Boolean)
    .join(' ');
  if (!text) return [];
  const safe = defuse(text);

  // Wrap to a sane measure rather than emitting one long line: this file is
  // read in a browser devtools pane as often as in an editor.
  const words = safe.split(/\s+/);
  const linesOut = [];
  let current = '';
  for (const w of words) {
    if (current && (current + ' ' + w).length > 72) {
      linesOut.push(current);
      current = w;
    } else {
      current = current ? current + ' ' + w : w;
    }
  }
  if (current) linesOut.push(current);

  return linesOut.map((l, i) =>
    linesOut.length === 1
      ? `${indent}/* ${l} */`
      : i === 0
        ? `${indent}/* ${l}`
        : i === linesOut.length - 1
          ? `${indent}   ${l} */`
          : `${indent}   ${l}`
  );
}

/** Render a run of declarations, preserving the comments that explain them. */
function declarations(list, indent) {
  const out = [];
  let first = true;

  for (const e of list) {
    const lead = comment(e.lead, indent);
    if (lead.length && !first && out[out.length - 1] !== '') out.push('');
    out.push(...lead);
    out.push(
      `${indent}${e.name}: ${e.value};` +
        (e.trailing ? ` /* ${defuse(e.trailing)} */` : '')
    );
    // Preserve the grouping of the source: the blank lines in _tokens.scss
    // separate the ramps from each other and are part of how it reads.
    if (e.breakAfter) out.push('');
    first = false;
  }
  return out.at(-1) === '' ? out.slice(0, -1) : out;
}

/**
 * Tokens the sheets need that the brand does not define.
 *
 * These are rules and running prose — the sheets' own layout, which the brand
 * has no opinion about. Monospace is deliberately NOT here: it used to be a
 * --ds-mono of the sheets' own, on the grounds that the brand set no fixed
 * width text, but the wordlist generator does, so --tw-font-mono is a brand
 * token now and the sheets take it like any other.
 */
const SHEET_TOKENS = {
  light: [
    ['--ds-rule', 'var(--tw-neutral-200)'],
    ['--ds-ink', '#2b2b2b']
  ],
  dark: [
    ['--ds-rule', 'var(--tw-neutral-650)'],
    ['--ds-ink', '#d4d4d4']
  ]
};

const sheetBlock = (which, indent) =>
  SHEET_TOKENS[which].map(([k, v]) => `${indent}${k}: ${v};`);

function render({ root, dark, light }) {
  const head = [
    '/* tehw0lf design tokens — GENERATED, do not edit.',
    ' *',
    ' * Source: apps/tehwolfde/src/assets/styles/_tokens.scss',
    ' * Regenerate: npm run design-tokens',
    ' *',
    ' * The app switches themes with body.dark / body.light. These sheets follow',
    ' * the viewer instead, so the same values are bound to :root and to both',
    ' * theme states. Edit _tokens.scss, never this file. */',
    ''
  ];

  const out = [
    ...head,
    ':root {',
    ...declarations(root, '  '),
    '',
    '  /* Light is the bare-:root default, per the Artifact page contract. */',
    ...declarations(light, '  '),
    '',
    '  /* Chrome for these spec sheets, not brand tokens. */',
    ...sheetBlock('light', '  '),
    '}',
    '',
    '@media (prefers-color-scheme: dark) {',
    "  :root:not([data-theme='light']) {",
    ...declarations(dark, '    '),
    '',
    ...sheetBlock('dark', '    '),
    '  }',
    '}',
    '',
    '/* Repeated verbatim: a media query cannot be overridden by an attribute',
    '   selector alone, so an explicit choice needs its own block. */',
    ":root[data-theme='dark'] {",
    ...declarations(dark, '  '),
    '',
    ...sheetBlock('dark', '  '),
    '}',
    ''
  ];

  return out.join('\n') + readFileSync(CHROME, 'utf8');
}

/* ---------- entry -------------------------------------------------------- */

function main(argv) {
  const check = argv.includes('--check');
  const outFlag = argv.indexOf('--out');
  const out = outFlag === -1 ? DEFAULT_OUT : resolve(argv[outFlag + 1]);

  const css = readFileSync(TOKENS, 'utf8');
  const generated = render({
    root: entries(block(css, ':root')),
    dark: entries(block(css, 'body.dark')),
    light: entries(block(css, 'body.light'))
  });

  if (check) {
    const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
    if (current === generated) {
      console.log('design-system tokens are up to date');
      return 0;
    }
    console.error(
      `design-system tokens are stale: ${out} does not match _tokens.scss.\n` +
        'Run: npm run design-tokens'
    );
    return 1;
  }

  writeFileSync(out, generated);
  console.log(`wrote ${out}`);
  return 0;
}

process.exit(main(process.argv.slice(2)));
