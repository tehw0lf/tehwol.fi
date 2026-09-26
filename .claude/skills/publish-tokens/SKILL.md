---
name: publish-tokens
description: Publish the brand tokens to the design system and the style guide artifacts after a change to _tokens.scss. Use when the user asks to publish, republish or sync the tokens, the design system or the style guide, or after a token change lands on main.
---

# Publish the brand tokens

The repo generates two published views of `_tokens.scss` and guards both, but
nothing uploads them. CI cannot: an artifact belongs to a person's account, and
a runner has no such identity. This session does — that is the whole reason this
skill exists rather than a workflow.

The two artifacts:

| What          | URL                                               | The file it takes                                         |
| ------------- | ------------------------------------------------- | --------------------------------------------------------- |
| Design system | https://claude.ai/artifact/N8SfD9v1qXKPjYuEA4LiPk | `tools/design-system/tokens.json` → `project/tokens.json` |
| Style guide   | https://claude.ai/artifact/MFNLXbxcYzfEV1pa56mMwF | `tools/style-guide/brand-tokens.html` → the page itself   |

The design system reads `project/tokens.json`. It does **not** read
`tokens.css`, which is the human-readable view and is published nowhere.

## Steps

**1. Make sure the generated files are current.**

```bash
npm run design-tokens:check && npm run style-guide:check
```

A failure here means the generated files are stale, not that publishing failed.
Run `npm run design-tokens && npm run style-guide`, and commit the result — this
skill publishes what is in the repo, so publishing a stale file would put the
wrong bytes in front of every reader. Do not continue until both pass.

**2. Check what is actually different.**

Read the live `project/tokens.json` (Artifact `read` with that path) and compare
it against `tools/design-system/tokens.json`. Report what changed — added,
removed and changed tokens by name — before writing anything. If they are
identical, say so and stop: there is nothing to publish, and a needless version
buries the real ones in the history.

**3. Publish the design system.**

Copy the file to `<scratchpad>/pub/project/tokens.json` and publish with `root`
set to that `pub` folder, `url` the design system's, `file_path` the absolute
path of the copy. Send only that file — everything else the artifact holds
(README, components, fonts, the index) stays as it is, and files not sent are
kept.

Do not send `project/design-system.json` unless a key of the index itself
changed, such as the title. Its `lastChange` is not worth a call on its own.

**4. Publish the style guide.**

`tools/style-guide/brand-tokens.html` is a complete page: publish it to the
style guide URL with `file_path` alone. Keep `icon` off — the artifact already
has one, and passing a new one changes it.

**5. Report.**

Name both URLs, say what changed in the tokens, and — if the design system holds
component cards whose guidelines quote a token value — say which of them now
disagree with the tokens they cite. The generator cannot see prose.

## What this skill does not do

It does not touch the repo. If `_tokens.scss` changed but was never committed,
that is a separate job with the usual branch, version bump and PR — say so
rather than quietly publishing from a dirty tree.
