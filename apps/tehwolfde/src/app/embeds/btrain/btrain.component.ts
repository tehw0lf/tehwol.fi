import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmbedComponent } from '../embed/embed.component';

@Component({
  selector: 'tehw0lf-btrain',
  standalone: true,
  imports: [EmbedComponent],
  template: `<tehw0lf-embed url="https://btrain.tehwolf.de" title="BTrain" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BtrainComponent {}
