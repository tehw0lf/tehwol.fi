import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';

import { ThemeService } from '../theme.service';

@Component({
  selector: 'tehw0lf-wordlist-generator',
  templateUrl: './wordlist-generator.component.html',
  styleUrls: ['./wordlist-generator.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WordlistGeneratorComponent implements OnInit, OnDestroy {
  buttonBackgroundColor = 'rgba(34, 34, 34, 0.75)';
  buttonStyle: string[] = [
    `"background-color": "${this.buttonBackgroundColor}"`,
    'color: "#cc7832"'
  ];

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
    this.buttonBackgroundColor = 'rgba(255, 255, 255, 0.75)';
  }

  switchToDark(): void {
    this.buttonBackgroundColor = 'rgba(34, 34, 34, 0.75)';
  }
}
