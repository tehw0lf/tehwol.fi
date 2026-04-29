import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmbedComponent } from '../embed/embed.component';

@Component({
  selector: 'tehw0lf-flowdive',
  standalone: true,
  imports: [EmbedComponent],
  template: `<tehw0lf-embed url="https://flowdive.tehwolf.de" title="Flowdive" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowdiveComponent {}
