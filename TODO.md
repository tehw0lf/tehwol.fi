# TODO

## The desktop nav overflows its flex container in German

**Status:** open · **Effort:** small · **Risk:** changes rendered layout

`apps/tehwolfde/src/app/components/nav/desktop/desktop.component.scss` sets
`margin: 0 10px 0 0` on the nav links. It is the last off-grid spacing value in
the codebase, and it is **load-bearing by accident**: raising it to
`--tw-space-3` (12px) fails the e2e test
`should not resize the language switcher when the locale changes`.

Measured in Firefox at 1280px:

|                     | English   | German    |
| ------------------- | --------- | --------- |
| switcher width      | 125.83px  | 125.83px  |
| switcher x, at 10px | 1013.83px | 1013.83px |
| switcher x, at 12px | 1007.83px | 1017.77px |

The switcher's own fixed-width label still works — its **width** is identical in
both locales. What breaks is its **position**. The links sit in a
`flex: 1 1 0%` container with the theme toggle, the language switcher and the
GitHub link following in flow; the German labels are wider
("Wortlisten-Generator" against "Wordlist Generator"); at 12px margins the row
no longer fits, the container overflows its flex share, and everything to its
right is pushed along.

**Approach:** stop the container overflowing rather than tuning the margin until
it fits. `min-width: 0` on the flex child is the usual fix for a flex item
refusing to shrink below its content — check it against the longest locale, not
English. Once the row can shrink, migrate the margin to `--tw-space-3` and drop
the explanatory comment in the stylesheet.

**Verify with:**

```bash
npx nx e2e tehwolfde-e2e -- --project=firefox \
  --grep "resize the language switcher"
```
