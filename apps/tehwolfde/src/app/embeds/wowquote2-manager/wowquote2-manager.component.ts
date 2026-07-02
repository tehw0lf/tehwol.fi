import { ChangeDetectionStrategy, Component } from '@angular/core';

import { EmbedComponent } from '../embed/embed.component';

@Component({
  selector: 'tehw0lf-wowquote2-manager',
  standalone: true,
  imports: [EmbedComponent],
  template: `<tehw0lf-embed url="https://tehw0lf.github.io/WoWQuote2-Manager/" title="WoWQuote2 Manager" />`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WoWQuote2ManagerComponent {}
