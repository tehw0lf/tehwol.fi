import { Component, OnDestroy, OnInit } from '@angular/core';
import { WordlistGeneratorComponent as WordlistGeneratorComponent_1 } from '@tehw0lf/wordlist-generator';
import { Subject, takeUntil, tap } from 'rxjs';

import { ThemeService } from '../theme.service';

@Component({
    selector: 'tehw0lf-wordlist-generator',
    templateUrl: './wordlist-generator.component.html',
    styleUrls: ['./wordlist-generator.component.scss'],
    standalone: true,
    imports: [WordlistGeneratorComponent_1]
})
export class WordlistGeneratorComponent implements OnInit, OnDestroy {
  buttonStyle = {
    'background-color': '#333333',
    color: '#cc7832'
  };

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    this.themeService.isLight
      .pipe(
        tap((isLight: boolean) => {
          isLight ? this.switchToLight() : this.switchToDark();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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
