import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmbedComponent } from '../embed/embed.component';

@Component({
  selector: 'tehw0lf-mutuals',
  standalone: true,
  imports: [EmbedComponent],
  template: `<tehw0lf-embed url="https://tehw0lf.github.io/mutuals/" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MutualsComponent {}
