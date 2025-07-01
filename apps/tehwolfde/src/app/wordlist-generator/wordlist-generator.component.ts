import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { WordlistGeneratorComponent as WordlistGeneratorComponent_1 } from '@tehw0lf/wordlist-generator';

import { ThemeService } from '../theme.service';

@Component({
    selector: 'tehw0lf-wordlist-generator',
    templateUrl: './wordlist-generator.component.html',
    styleUrls: ['./wordlist-generator.component.scss'],
    imports: [WordlistGeneratorComponent_1],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class WordlistGeneratorComponent {
  themeService = inject(ThemeService);

  buttonStyle = computed(() => ({
    'background-color': this.themeService.theme() === 'dark' 
      ? '#333333' 
      : 'rgba(255, 255, 255, 0.75)',
    color: '#cc7832'
  }));
}
