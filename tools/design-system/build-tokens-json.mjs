#!/usr/bin/env node
/**
 * Builds the published design system's tokens.json from _tokens.scss.
 *
 * The design system at https://claude.ai/artifact/N8SfD9v1qXKPjYuEA4LiPk does
 * not read tokens.css. It keeps the brand as project/tokens.json — a list of
 * entries per family, each with a name, a value and a usage note — and its
 * pages, previews and generated cards are built from that file.
 *
 * So tokens.css alone never kept the published system honest: design-tokens
 * and style-guide both guard files the system does not read, which let a token
 * change pass every check in the repo while the published brand stayed stale.
 * This closes that gap.
 *
 *   npm run design-tokens-json         regenerate
 *   npm run design-tokens-json:check   fail if the committed file is stale
 *
 * Or directly, which is what those scripts call:
 *
 *   node tools/design-system/build-tokens-json.mjs [--out <path>] [--check]
 *
 * WHAT IS GENERATED AND WHAT IS NOT
 * Names, values and the theme pairing come from _tokens.scss. The usage notes
 * come from notes.json beside this file, because the source comments explain
 * groups ("Neutral ramp — anchored at 500 on the brand grey") while a reader of
 * the design system wants a sentence per token saying when to reach for it. A
 * token with no note fails --check rather than publishing undescribed.
 *
 * THE THEME TRANSFORM
 * _tokens.scss splits colour across body.dark and body.light; the palette
 * independent values sit on :root. tokens.json wants one flat colour list whose
 * entries carry a value per theme, so the two blocks are zipped by name. Dark
 * is first: it is the original palette, and a token missing from a later theme
 * inherits the first theme's value.
 *
 * `var(--tw-neutral-850)` becomes the alias `{tw-neutral-850}`, which is what
 * the design system's format reads. A var() left as-is would drop the token.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { block, entries } from './build.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const TOKENS = resolve(ROOT, 'apps/tehwolfde/src/assets/styles/_tokens.scss');
const NOTES = resolve(HERE, 'notes.json');
const DEFAULT_OUT = resolve(HERE, 'tokens.json');

/* ---------- token families ----------------------------------------------- */

/**
 * Which :root token belongs in which family, by name prefix, in the order the
 * published system lists them.
 *
 * Anything on :root that matches no prefix is a colour — the brand grey and the
 * neutral ramp are the whole of that case today. A new prefix that belongs in
 * its own family has to be added here; until it is, its tokens land in colour,
 * where a non-colour value would be dropped by the design system rather than
 * shown wrong. That is the safe direction to fail in.
 */
const FAMILIES = [
  { key: 'spacing', prefix: '--tw-space-' },
  { key: 'radius', prefix: '--tw-radius-' },
  { key: 'weight', prefix: '--tw-weight-' },
  { key: 'leading', prefix: '--tw-leading-' },
  { key: 'effect', prefix: '--tw-glass-blur' }
];

/** Names that describe type and are consumed by the `type` section, not a family. */
const TYPE_PREFIXES = [
  '--tw-font-',
  '--tw-text-x',
  '--tw-text-s',
  '--tw-text-b',
  '--tw-text-l',
  '--tw-text-2'
];

const isTypeToken = (name) => TYPE_PREFIXES.some((p) => name.startsWith(p));

const familyOf = (name) =>
  FAMILIES.find((f) => name.startsWith(f.prefix))?.key ?? 'color';

/* ---------- value transforms ---------------------------------------------- */

/** `var(--tw-neutral-850)` -> `{tw-neutral-850}`, the design system's alias form. */
function alias(value) {
  const m = /^var\(\s*(--[\w-]+)\s*\)$/.exec(value.trim());
  return m ? `{${m[1].slice(2)}}` : value.trim();
}

/** `blur(50px)` -> `50px`. The family holds the radius; the function is CSS. */
const unwrapBlur = (value) => {
  const m = /^blur\(\s*(.+?)\s*\)$/.exec(value.trim());
  return m ? m[1] : value.trim();
};

/** A bare number stays a number in JSON; everything else is a string. */
const scalar = (value) =>
  /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : value;

/* ---------- assembly ------------------------------------------------------ */

const usage = (name, notes) => notes[name.slice(2)] ?? '';

function build() {
  const css = readFileSync(TOKENS, 'utf8');
  const notes = JSON.parse(readFileSync(NOTES, 'utf8'));

  const root = entries(block(css, ':root'));
  const dark = entries(block(css, 'body.dark'));
  const light = entries(block(css, 'body.light'));

  /* Colour: the themed blocks zipped by name, then the palette independent
     colours from :root appended with one value used for both themes. */
  const lightByName = new Map(light.map((e) => [e.name, e.value]));
  const themed = dark.map((e) => ({
    name: e.name.slice(2),
    value: {
      dark: alias(e.value),
      light: alias(lightByName.get(e.name) ?? e.value)
    },
    usage: usage(e.name, notes)
  }));

  const rootColors = root
    .filter((e) => familyOf(e.name) === 'color' && !isTypeToken(e.name))
    .map((e) => ({
      name: e.name.slice(2),
      value: { dark: alias(e.value), light: alias(e.value) },
      usage: usage(e.name, notes)
    }));

  /* The other families, in the order FAMILIES lists them. */
  const families = {};
  for (const { key } of FAMILIES) {
    const tokens = root
      .filter((e) => familyOf(e.name) === key)
      .map((e) => ({
        name: e.name.slice(2),
        value: scalar(key === 'effect' ? unwrapBlur(e.value) : e.value),
        usage: usage(e.name, notes)
      }));
    if (tokens.length) families[key] = { tokens };
  }

  /* Type: the size ramp and line heights drive the style list, so a size added
     to _tokens.scss shows up as a style rather than being silently ignored. */
  const size = (n) =>
    root.find((e) => e.name === `--tw-text-${n}`)?.value ?? null;
  const weightOf = (n) =>
    Number(root.find((e) => e.name === `--tw-weight-${n}`)?.value ?? 400);
  const leadingOf = (n) =>
    Number(root.find((e) => e.name === `--tw-leading-${n}`)?.value ?? 1.5);

  const STYLES = [
    ['display', '2xl', 'tight', 'light'],
    ['heading', 'xl', 'tight', 'medium'],
    ['prose', 'lg', 'loose', 'regular'],
    ['body', 'base', 'normal', 'regular'],
    ['label', 'sm', 'normal', 'regular'],
    ['caption', 'xs', 'normal', 'regular']
  ];

  const family =
    root.find((e) => e.name === '--tw-font-sans')?.value ??
    'Roboto, sans-serif';

  /* The notes guard, in both directions, over every token _tokens.scss defines
     — not only the ones that reach a usage() call. Type tokens are consumed by
     the `type` section rather than emitted as a family entry, so deriving this
     from the call sites let a new size or weight publish undescribed. */
  const defined = new Set(
    [...root, ...dark, ...light].map((e) => e.name.slice(2))
  );

  // Defined tokens the notes file does not describe.
  const missing = [...defined].filter((k) => !notes[k]).sort();

  // Names the notes file carries that no token in _tokens.scss defines. A
  // renamed token would otherwise leave its old note behind, still read as
  // current by whoever edits the file next.
  const orphaned = Object.keys(notes)
    .filter((k) => !k.startsWith('$') && !defined.has(k))
    .sort();

  const json = {
    name: 'tehw0lf',
    version: 1,
    meta: {
      source:
        'apps/tehwolfde/src/assets/styles/_tokens.scss in the tehw0lf Nx monorepo',
      generated: 'npm run design-tokens-json'
    },
    color: {
      themes: [
        { id: 'dark', name: 'Dark' },
        { id: 'light', name: 'Light' }
      ],
      tokens: [...rootColors, ...themed]
    },
    type: {
      fonts: [300, 400, 500].map((w) => ({
        family: 'Roboto',
        file: `fonts/roboto-${w}-latin.woff2`,
        weight: String(w)
      })),
      families: { sans: family },
      groups: [
        {
          name: 'Text',
          family: 'sans',
          styles: STYLES.filter(([, s]) => size(s)).map(
            ([name, s, lead, weight]) => ({
              name,
              fontSize: size(s),
              lineHeight: leadingOf(lead),
              fontWeight: weightOf(weight)
            })
          )
        }
      ]
    },
    ...families
  };

  return { json, missing, orphaned };
}

/* ---------- entry --------------------------------------------------------- */

function main(argv) {
  const check = argv.includes('--check');
  const outFlag = argv.indexOf('--out');

  /* `--out` last would resolve(undefined) and throw; `--out --check` would take
     the flag as the path and quietly read or write a file named `--check`. */
  const outValue = outFlag === -1 ? null : argv[outFlag + 1];
  if (outFlag !== -1 && (outValue === undefined || outValue.startsWith('--'))) {
    console.error(
      '--out needs a path.\n' +
        'Usage: node tools/design-system/build-tokens-json.mjs [--out <path>] [--check]'
    );
    return 1;
  }
  const out = outValue === null ? DEFAULT_OUT : resolve(outValue);

  const { json, missing, orphaned } = build();

  if (missing.length) {
    console.error(
      `design-system tokens.json: no usage note for ${missing.join(', ')}.\n` +
        `Add one per token to ${NOTES} — the published system shows this text.`
    );
    return 1;
  }

  if (orphaned.length) {
    console.error(
      `design-system tokens.json: ${NOTES} describes ${orphaned.join(', ')}, ` +
        'which _tokens.scss no longer defines.\nRemove the stale note, or ' +
        'rename it to match the token.'
    );
    return 1;
  }

  const generated = JSON.stringify(json, null, 2) + '\n';

  if (check) {
    const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
    if (current === generated) {
      console.log('design-system tokens.json is up to date');
      return 0;
    }
    console.error(
      `design-system tokens.json is stale: ${out} does not match _tokens.scss.\n` +
        'Run: npm run design-tokens-json'
    );
    return 1;
  }

  writeFileSync(out, generated);
  console.log(`wrote ${out}`);
  return 0;
}

process.exit(main(process.argv.slice(2)));
