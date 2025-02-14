import { Component, effect } from '@angular/core';
import { WordlistGeneratorComponent as WordlistGeneratorComponent_1 } from '@tehw0lf/wordlist-generator';

import { ThemeService } from '../theme.service';

@Component({
    selector: 'tehw0lf-wordlist-generator',
    templateUrl: './wordlist-generator.component.html',
    styleUrls: ['./wordlist-generator.component.scss'],
    imports: [WordlistGeneratorComponent_1]
})
export class WordlistGeneratorComponent {
  buttonStyle = {
    'background-color': '#333333',
    color: '#cc7832'
  };

  constructor(public themeService: ThemeService) {
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
