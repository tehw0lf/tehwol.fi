# TODO

## The desktop nav appears 300px before its content fits

**Status:** open · **Effort:** small · **Risk:** changes which nav renders between 960px and 1280px

`apps/tehwolfde/src/app/components/nav/desktop/desktop.component.ts` switches
from the burger menu to the toolbar at `(min-width: 960px)`, but the toolbar
row does not fit at that width in either locale. Measured in Firefox with the
links on `--tw-space-3`:

|                                 | English | German |
| ------------------------------- | ------- | ------ |
| link row, min-content           | 832px   | 926px  |
| theme toggle + switcher + GitHub | 312px   | 312px  |
| toolbar padding                 | 32px    | 32px   |
| viewport the row needs          | 1176px  | 1270px |

The link container now has `min-width: 0` and `overflow-x: auto`, so below
those widths the links scroll inside their own box and the controls to their
right stay put. Before that the container refused to shrink and pushed the
whole row off the right edge, which put a horizontal scrollbar on the page.
Scrolling primary navigation is a fallback, not a design: between 960px and
about 1270px the fourth and fifth link are cut off until the strip is scrolled,
and Playwright hides scrollbars in headless mode, so screenshots will not show
the affordance real browsers do.

**Approach:** show the desktop nav only where it fits. Two candidates, and
they combine:

- Raise the breakpoint. `1280px` fits German with 10px to spare and is what the
  Playwright desktop projects run at, so the desktop e2e tests keep exercising
  the toolbar. `should not show mobile sidenav on desktop screens` in
  `mobile-sidenav.spec.ts` sets a 1200px viewport and has to move with it.
- Make the row narrower. Every link carries two gaps, the `flex-gap-20` on its
  `.nav-item` and the `--tw-space-3` on the button, 32px in all; dropping the
  outer one saves 80px. That is a change to the rhythm the design shipped with,
  so it wants a look, not just a measurement.

**Verify with:**

```bash
npx nx e2e tehwolfde-e2e -- --project=firefox --grep "sidenav on desktop|resize the language switcher"
```
