import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tehw0lf-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WordlistGeneratorComponent {
  buttonBackgroundColor = 'rgba(34, 34, 34, 0.75)';

  constructor() {
    //
  }

  switchToLight(): void {
    this.buttonBackgroundColor = 'rgba(255, 255, 255, 0.75)';
  }

  switchToDark(): void {
    this.buttonBackgroundColor = 'rgba(34, 34, 34, 0.75)';
  }
}
