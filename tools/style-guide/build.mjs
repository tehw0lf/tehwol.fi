#!/usr/bin/env node
/**
 * Builds the brand style guide from _tokens.scss.
 *
 * The guide is documentation of the tokens, so it is generated from them rather
 * than written alongside them — a hand-maintained copy drifts, which is the
 * problem the tokens were introduced to solve in the first place.
 *
 *   npm run style-guide          regenerate
 *   npm run style-guide:check    fail if the committed guide is stale
 *
 * Or directly, which is what those scripts call:
 *
 *   node tools/style-guide/build.mjs [--out <path>] [--check]
 *
 * --check exits non-zero if the generated output differs from what is on disk.
 * It runs ahead of `nx affected:lint`, so a token change that never made it into
 * the guide fails the build rather than landing as a silent inconsistency.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const TOKENS = resolve(ROOT, 'apps/tehwolfde/src/assets/styles/_tokens.scss');
const AVATAR = resolve(ROOT, 'avatar.svg');
const DEFAULT_OUT = resolve(HERE, 'brand-tokens.html');

/* ---------- parsing ------------------------------------------------------ */

/** Pull one `<selector> { … }` block out of the stylesheet. */
function block(css, selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`No "${selector}" block in ${TOKENS}`);
  const end = css.indexOf('\n}', start);
  if (end === -1) throw new Error(`Unterminated "${selector}" block in ${TOKENS}`);
  return css.slice(start, end);
}

/** Custom-property declarations in a block, comments stripped. */
function declarations(text) {
  const out = new Map();
  for (const raw of text.split('\n')) {
    const line = raw.split('//')[0].trim();
    const m = /^(--[\w-]+):\s*(.+?);/.exec(line);
    if (m) out.set(m[1], m[2].trim());
  }
  return out;
}

/** Follow var() indirection until a literal falls out. */
function resolveValue(value, scope, root) {
  let current = value;
  for (let hops = 0; hops < 10; hops++) {
    if (!current.startsWith('var(')) return current;
    const inner = current.slice(4, current.lastIndexOf(')')).split(',')[0].trim();
    const next = scope.get(inner) ?? root.get(inner);
    if (next === undefined) return current;
    current = next;
  }
  throw new Error(`var() chain too deep starting at "${value}"`);
}

function resolveAll(scope, root) {
  return new Map([...scope].map(([k, v]) => [k, resolveValue(v, scope, root)]));
}

/* ---------- contrast ----------------------------------------------------- */

function luminance(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const channels = [0, 2, 4]
    .map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return Math.round(((hi + 0.05) / (lo + 0.05)) * 100) / 100;
}

/* ---------- page chrome -------------------------------------------------- */

/**
 * The guide's own chrome, derived from the tokens it documents rather than
 * restated as literals — otherwise a token change updates the tables while
 * leaving the page around them on the old palette.
 *
 * Three values are the guide's own, and each is here for a measured reason:
 * `--bad` must read as an error on a dark ground, where --tw-danger (#ca0101)
 * sits at 2.91:1; `--brand` is darkened in light mode so the wolf mark holds its
 * edge on white; and `--ink` is running prose, which wants more contrast than
 * any UI token carries. Secondary text takes --tw-text-muted, which is the token
 * for exactly that and clears AA on both grounds.
 */
function chrome(theme, { brandMark, danger, bodyInk }) {
  const t = (name) => theme.get(name);
  const tint = (hex, alpha) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
    return `rgba(${r},${g},${b},${alpha})`;
  };
  return [
    `--bg:${t('--tw-bg')}; --surface:${t('--tw-surface')}; --panel:${t('--tw-surface-raised')};`,
    `--rule:${t('--tw-control-bg')}; --hair:${t('--tw-surface-raised')};`,
    `--ink:${bodyInk}; --soft:${t('--tw-text-muted')};`,
    `--blue:${t('--tw-text')}; --accent:${t('--tw-accent')}; --brand:${brandMark};`,
    `--ok:${t('--tw-success')}; --ok-bd:${tint(t('--tw-success'), 0.35)}; --ok-bg:${tint(t('--tw-success'), 0.08)};`,
    `--wr:${t('--tw-warn')}; --wr-bd:${tint(t('--tw-warn'), 0.35)}; --wr-bg:${tint(t('--tw-warn'), 0.08)};`,
    `--bad:${danger}; --bad-bd:${tint(danger, 0.35)}; --bad-bg:${tint(danger, 0.08)};`
  ].join('\n  ');
}

/* ---------- content ------------------------------------------------------ */

/** Ink tokens name the surface they sit on; surfaces carry no ratio. */
const TOKEN_ROWS = [
  ['--tw-bg', 'page ground', null],
  ['--tw-surface', 'raised surface', null],
  ['--tw-surface-raised', 'panel', null],
  ['--tw-control-bg', 'control surface', null],
  ['--tw-control-text', 'text on controls', '--tw-control-bg'],
  ['--tw-text', 'body copy', '--tw-bg'],
  ['--tw-text-dim', 'secondary, large text', '--tw-bg'],
  ['--tw-text-muted', 'muted', '--tw-bg'],
  ['--tw-accent', 'accent', '--tw-bg'],
  ['--tw-accent-hover', 'accent, hover', '--tw-bg'],
  ['--tw-link', 'links', '--tw-bg'],
  ['--tw-success', 'success', '--tw-bg'],
  ['--tw-warn', 'warning', '--tw-bg'],
  ['--tw-danger', 'danger', '--tw-bg']
];

/** Values this stylesheet and the fwdark userstyle arrived at independently. */
const SHARED_WITH_FWDARK = [
  ['#cc7832', '--color-link', '--tw-accent', 'the burnt orange'],
  ['#1a1a1a', '--color-mainbg', '--tw-neutral-900', 'the ground'],
  ['#f08b39', '--color-link-active', '--tw-accent-hover', 'the hover state'],
  ['#2f2f2f', '--color-mainheader-bg', '--tw-neutral-750', 'the raised tone']
];

const escape = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function ratioBadge(value, ground) {
  const r = contrast(value, ground);
  const kind = r >= 4.5 ? 'pass' : r >= 3 ? 'large' : 'fail';
  const label = r >= 4.5 ? 'AA' : r >= 3 ? 'AA&nbsp;Large' : 'below&nbsp;AA';
  return `<span class="r ${kind}">${r}:1 · ${label}</span>`;
}

function swatchCell(value, ground) {
  return (
    `<span class="dot" style="background:${escape(value)}"></span><code>${escape(value)}</code>` +
    (ground ? ratioBadge(value, ground) : '')
  );
}

/** The wolf mark, lifted from the avatar so the guide cannot drift from it. */
function markPath() {
  const svg = readFileSync(AVATAR, 'utf8');
  const m = /\sd="([^"]+)"/.exec(svg);
  if (!m) throw new Error(`No path data in ${AVATAR}`);
  return m[1];
}

function render({ root, dark, light }) {
  const rows = TOKEN_ROWS.filter(([token]) => dark.has(token))
    .map(
      ([token, role, ground]) => `<tr>
      <th scope="row"><code class="tok">${token}</code><span class="role">${role}</span></th>
      <td>${swatchCell(dark.get(token), ground && dark.get(ground))}</td>
      <td>${swatchCell(light.get(token), ground && light.get(ground))}</td>
    </tr>`
    )
    .join('\n    ');

  const ramp = [...root]
    .filter(([k]) => k.startsWith('--tw-neutral-'))
    .map(([k, v]) => {
      const step = k.split('-').pop();
      const anchor = step === '500';
      return `<div class="step${anchor ? ' anchor' : ''}">
        <span class="bar" style="background:${escape(v)}"></span>
        <code class="n">${step}</code><code class="h">${escape(v)}</code>
        ${anchor ? '<span class="tag">= --tw-brand</span>' : ''}
      </div>`;
    })
    .join('\n      ');

  const shared = SHARED_WITH_FWDARK.map(
    ([hex, fw, tw, role]) =>
      `<tr><td><span class="dot" style="background:${hex}"></span><code>${hex}</code></td>` +
      `<td><code class="dim">${fw}</code></td><td><code class="dim">${tw}</code></td>` +
      `<td class="muted">${role}</td></tr>`
  ).join('\n      ');

  // The mark is the brand grey in dark; on white it needs darkening to hold an
  // edge, and #8e8e8e only reaches 3.28:1 there.
  const lightChrome = chrome(light, {
    brandMark: '#6b6b6b',
    danger: light.get('--tw-danger'),
    bodyInk: '#2b2b2b'
  });
  const darkChrome = chrome(dark, {
    brandMark: root.get('--tw-brand'),
    danger: '#e05252',
    bodyInk: '#c9c9c9'
  });

  const d = (t) => escape(dark.get(t));
  const l = (t) => escape(light.get(t));

  return `<title>tehw0lf Brand Tokens</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Roboto+Mono:wght@400;500&display=swap">
<style>
:root {
  ${lightChrome}
  --mono:'Roboto Mono',ui-monospace,SFMono-Regular,Menlo,monospace;
  --sans:Roboto,'Helvetica Neue',system-ui,sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
  ${darkChrome}
  }
}
:root[data-theme="dark"] {
  ${darkChrome}
}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font-family:var(--sans);
  font-weight:300;line-height:1.65;-webkit-font-smoothing:antialiased}
.wrap{max-width:1060px;margin:0 auto;padding:0 28px}
header{padding:72px 0 52px;border-bottom:1px solid var(--rule);
  display:flex;gap:34px;align-items:center;flex-wrap:wrap}
.mark{width:86px;height:86px;flex:none} .mark path{fill:var(--brand)}
h1{font-size:clamp(30px,5vw,45px);font-weight:700;margin:0;color:var(--ink);
  letter-spacing:-.022em;text-wrap:balance;line-height:1.1}
.sub{margin:10px 0 0;color:var(--soft);max-width:62ch;font-size:15.5px}
.sub b{color:var(--blue);font-weight:400}
section{padding:48px 0;border-bottom:1px solid var(--rule)}
section:last-of-type{border-bottom:none}
h2{font-family:var(--mono);font-size:11.5px;font-weight:500;letter-spacing:.16em;
  text-transform:uppercase;color:var(--accent);margin:0 0 6px}
.lede{margin:0 0 26px;color:var(--soft);max-width:66ch;font-size:15px}
.lede code,.note code,p code{color:var(--blue);font-size:12.5px}
code{font-family:var(--mono);font-size:12px}
.tok{color:var(--blue);font-weight:500;display:block}
.role{font-size:12px;color:var(--soft);font-weight:300}
.dot{display:inline-block;width:11px;height:11px;border-radius:2px;
  margin-right:9px;vertical-align:-1px;border:1px solid var(--hair)}
.tblwrap{overflow-x:auto;border:1px solid var(--rule);border-radius:3px}
table{width:100%;border-collapse:collapse;font-size:13.5px;min-width:600px}
thead th{text-align:left;font-family:var(--mono);font-size:10.5px;font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--soft);
  padding:13px 16px;background:var(--surface);border-bottom:1px solid var(--rule)}
tbody th{text-align:left;font-weight:400;padding:13px 16px;
  border-bottom:1px solid var(--hair);vertical-align:top;width:32%}
td{padding:13px 16px;border-bottom:1px solid var(--hair);vertical-align:top}
tbody tr:last-child th,tbody tr:last-child td{border-bottom:none}
td code{color:var(--ink);text-transform:uppercase;font-size:11.5px}
.muted{color:var(--soft)}
code.dim{color:var(--soft);font-size:11.5px}
.r{display:block;font-family:var(--mono);font-size:10.5px;margin-top:7px;
  padding:2.5px 7px;border-radius:2px;width:fit-content;
  font-variant-numeric:tabular-nums;border:1px solid}
.r.pass{color:var(--ok);border-color:var(--ok-bd);background:var(--ok-bg)}
.r.large{color:var(--wr);border-color:var(--wr-bd);background:var(--wr-bg)}
.r.fail{color:var(--bad);border-color:var(--bad-bd);background:var(--bad-bg)}
.ramp{display:flex;flex-direction:column;gap:2px}
.step{display:flex;align-items:center;gap:14px;padding:5px 0}
.bar{height:26px;width:180px;border-radius:2px;flex:none;border:1px solid var(--hair)}
.step .n{color:var(--soft);width:34px;font-variant-numeric:tabular-nums}
.step .h{color:var(--ink);text-transform:uppercase;font-size:11.5px}
.step.anchor .bar{width:230px}
.tag{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;
  color:var(--accent);border:1px solid var(--accent);padding:2px 7px;border-radius:2px}
.specs{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:18px}
.spec{border:1px solid var(--rule);border-radius:3px;overflow:hidden}
.spec-hd{font-family:var(--mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;
  padding:9px 20px;border-bottom:1px solid var(--rule);background:var(--surface);color:var(--soft)}
.spec-bd{padding:26px 24px;display:flex;flex-direction:column;gap:13px}
.spec-bd h3{margin:0;font-size:19px;font-weight:500;letter-spacing:-.01em}
.spec-bd p{margin:0;font-size:14px}
.spec-bd a{font-weight:700;text-decoration:none}
.spec-bd a:hover{text-decoration:underline}
.btnrow{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
button{font-family:var(--sans);font-size:13px;padding:8px 17px;border-radius:3px;
  border:1px solid transparent;cursor:pointer}
.d{background:${d('--tw-bg')}} .d h3{color:#e6e6e6} .d p{color:${d('--tw-text')}} .d a{color:${d('--tw-link')}}
.d .b1{background:${d('--tw-control-bg')};color:${d('--tw-control-text')}}
.d .b2{background:transparent;color:${d('--tw-text')};border-color:${d('--tw-control-bg')}}
.l{background:${l('--tw-bg')}} .l h3{color:#2b2b2b} .l p{color:${l('--tw-text')}} .l a{color:${l('--tw-link')}}
.l .b1{background:${l('--tw-control-bg')};color:${l('--tw-control-text')}}
.l .b2{background:transparent;color:${l('--tw-text')};border-color:#dcdcdc}
button:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
pre{background:var(--surface);border:1px solid var(--rule);border-radius:3px;
  padding:16px 18px;overflow-x:auto;font-family:var(--mono);font-size:12.5px;
  line-height:1.7;margin:0;color:var(--ink)}
pre .c{color:var(--soft)} pre .v{color:var(--blue)}
.note{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:22px}
.note div{border-left:2px solid var(--accent);padding:2px 0 2px 17px}
.note h4{margin:0 0 5px;font-size:13.5px;font-weight:500;color:var(--ink);font-family:var(--mono)}
.note p{margin:0;font-size:13.5px;color:var(--soft)}
footer{padding:42px 0 64px;color:var(--soft);font-size:12.5px;font-family:var(--mono)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>

<div class="wrap">
<header>
  <svg class="mark" viewBox="0 0 500 500" aria-label="tehw0lf wolf mark" role="img">
    <g transform="translate(0,500) scale(0.1,-0.1)"><path d="${markPath()}"/></g>
  </svg>
  <div>
    <h1>tehw0lf brand tokens</h1>
    <p class="sub">The palette was never designed in one sitting — it grew across the
    website, the favicon and the <b>fwdark</b> userstyle, arriving at the same colours
    each time. This is that palette, named, paired across both themes, and measured.</p>
  </div>
</header>

<section>
  <h2>Brand</h2>
  <p class="lede">One grey, carried since 2022. It fills the avatar and the favicon and
  stands as the default of the colour embed. Not Material Grey, not Darcula — it has no
  source outside this workspace. It is the one value that does not shift between themes:
  it is the mark, not a UI colour.</p>
  <div class="ramp">
    <div class="step anchor">
      <span class="bar" style="background:${escape(root.get('--tw-brand'))}"></span>
      <code class="n">—</code><code class="h">${escape(root.get('--tw-brand'))}</code>
      <span class="tag">--tw-brand</span>
    </div>
  </div>
</section>

<section>
  <h2>Two themes</h2>
  <p class="lede">A theme class on <code>&lt;body&gt;</code> — <code>.dark</code> or
  <code>.light</code> — selects the set. Every ink token is measured against the surface
  it actually sits on, named in its row; the ratio in each column is against that
  column's own ground, never the other one's.</p>
  <div class="tblwrap">
  <table>
    <thead><tr><th>Token</th><th>Dark</th><th>Light</th></tr></thead>
    <tbody>
    ${rows}
    </tbody>
  </table>
  </div>
</section>

<section>
  <h2>Neutral ramp</h2>
  <p class="lede">Anchored at 500 on the brand grey, so the mark and the interface belong
  to one family. Ground-independent — both themes draw their surfaces from this one ramp,
  from opposite ends.</p>
  <div class="ramp">
      ${ramp}
  </div>
</section>

<section>
  <h2>Specimen</h2>
  <p class="lede">The same component in both themes. Roboto for running text, Roboto Mono
  for tokens and values — the faces the site already ships.</p>
  <div class="specs">
    <div class="spec">
      <div class="spec-hd">body.dark</div>
      <div class="spec-bd d">
        <h3>Cartesian wordlists</h3>
        <p>Style inputs default to <code style="color:${d('--tw-accent')}">var(--tw-*, …)</code>,
        so an untokenised consumer renders as before. Defined in <code>_tokens.scss</code>.</p>
        <div class="btnrow">
          <button class="b1">Generate wordlist</button>
          <button class="b2">Cancel</button>
        </div>
      </div>
    </div>
    <div class="spec">
      <div class="spec-hd">body.light</div>
      <div class="spec-bd l">
        <h3>Cartesian wordlists</h3>
        <p>Style inputs default to <code style="color:${l('--tw-accent')}">var(--tw-*, …)</code>,
        so an untokenised consumer renders as before. Defined in <code>_tokens.scss</code>.</p>
        <div class="btnrow">
          <button class="b1">Generate wordlist</button>
          <button class="b2">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <h2>Using these in a new app</h2>
  <p class="lede">Copy the token block, then reference it. Two rules carry most of the
  weight, and both were learned the hard way on this palette.</p>
  <pre><span class="c">/* Controls do not borrow --tw-accent: it is tuned for the page
   ground and only reaches ${contrast(dark.get('--tw-accent'), dark.get('--tw-control-bg'))}:1 on the control surface. */</span>
button {
  background: <span class="v">var(--tw-control-bg)</span>;
  color: <span class="v">var(--tw-control-text)</span>;
}

<span class="c">/* In a publishable library, carry the dark value as a fallback so
   a consumer without tokens renders exactly as it does today. */</span>
buttonStyle = input({
  color: <span class="v">'var(--tw-accent, ${d('--tw-accent')})'</span>
});</pre>
  <div class="note" style="margin-top:26px">
    <div>
      <h4>Never in Sass</h4>
      <p>A Sass colour variable compiles to one fixed value and cannot follow the theme.
      That is what left the light mode wearing dark ink.</p>
    </div>
    <div>
      <h4>Measure against the surface</h4>
      <p>Not against the page. A colour that clears AA on the ground can fail on a
      control sitting on top of it.</p>
    </div>
    <div>
      <h4>Semantic stays separate</h4>
      <p>Success, warning and danger are their own tokens. They never stand in for the
      accent, and the accent never stands in for them.</p>
    </div>
  </div>
</section>

<section>
  <h2>Shared with fwdark</h2>
  <p class="lede">fwdark is a userstyle for a browser game — a different medium, a
  different decade of code. These values were arrived at twice, independently. That
  repetition is what makes them a brand rather than a preference.</p>
  <div class="tblwrap">
  <table>
    <thead><tr><th>Value</th><th>fwdark</th><th>tehw0lf</th><th>Role</th></tr></thead>
    <tbody>
      ${shared}
    </tbody>
  </table>
  </div>
</section>

<footer>tehw0lf · generated from _tokens.scss · every ratio measured against its own ground</footer>
</div>
`;
}

/* ---------- entry -------------------------------------------------------- */

function main(argv) {
  const check = argv.includes('--check');
  const outFlag = argv.indexOf('--out');
  const out = outFlag === -1 ? DEFAULT_OUT : resolve(argv[outFlag + 1]);

  const css = readFileSync(TOKENS, 'utf8');
  const root = declarations(block(css, ':root'));
  const html = render({
    root,
    dark: resolveAll(declarations(block(css, 'body.dark')), root),
    light: resolveAll(declarations(block(css, 'body.light')), root)
  });

  if (check) {
    const current = existsSync(out) ? readFileSync(out, 'utf8') : '';
    if (current === html) {
      console.log('style guide is up to date');
      return 0;
    }
    console.error(
      `style guide is stale: ${out} does not match _tokens.scss.\n` +
        'Run: npm run style-guide'
    );
    return 1;
  }

  writeFileSync(out, html);
  console.log(`wrote ${out}`);
  return 0;
}

process.exit(main(process.argv.slice(2)));
