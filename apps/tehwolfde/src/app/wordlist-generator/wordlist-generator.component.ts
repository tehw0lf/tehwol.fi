import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
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

  buttonStyle = {
    'background-color': '#333333',
    color: '#cc7832'
  };

  constructor() {
    effect(() =>
      this.themeService.theme() === 'dark'
        ? this.switchToDark()
        : this.switchToLight()
    );
  }

  switchToLight(): void {
    this.buttonStyle = {
      'background-color': 'rgba(255, 255, 255, 0.75)',
      color: '#cc7832'
    };
  }

  switchToDark(): void {
    this.buttonStyle = {
      'background-color': '#333333',
      color: '#cc7832'
    };
  }
}
