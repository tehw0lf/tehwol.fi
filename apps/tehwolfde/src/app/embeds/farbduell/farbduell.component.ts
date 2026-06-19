import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmbedComponent } from '../embed/embed.component';

@Component({
  selector: 'tehw0lf-farbduell',
  standalone: true,
  imports: [EmbedComponent],
  template: `<tehw0lf-embed url="https://farbduell.tehwolf.de" title="Farbduell" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FarbduellComponent {}
