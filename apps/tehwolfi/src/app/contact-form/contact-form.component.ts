import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactFormComponent as ContactFormComponent_1 } from '@tehw0lf/contact-form';
import { Subject, takeUntil, tap } from 'rxjs';

import { ThemeService } from '../theme.service';

@Component({
    selector: 'tehw0lf-contact-form',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.scss'],
    standalone: true,
    imports: [ContactFormComponent_1]
})
export class ContactFormComponent implements OnInit, OnDestroy {
  buttonStyle = {
    'background-color': '#333333',
    border: 'none',
    color: '#cc7832'
  };

  formStyle = {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)',
    'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
  };

  inputStyle = {
    color: '#282b2e'
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
      border: 'none',
      color: '#cc7832'
    };

    this.formStyle = {
      color: '#437da8',
      'background-color': 'rgba(255, 255, 255, 0.75)',
      'backdrop-filter': 'blur(50px)',
      'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
    };

    this.inputStyle = {
      color: '#282b2e'
    };
  }

  switchToDark(): void {
    this.buttonStyle = {
      'background-color': '#333333',
      border: 'none',
      color: '#cc7832'
    };

    this.formStyle = {
      color: '#437da8',
      'background-color': 'rgba(34, 34, 34, 0.75)',
      'backdrop-filter': 'blur(50px)',
      'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
    };

    this.inputStyle = {
      color: '#282b2e'
    };
  }
}
