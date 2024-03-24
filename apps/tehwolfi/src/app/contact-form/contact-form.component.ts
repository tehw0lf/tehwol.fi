import { Component, effect } from '@angular/core';
import { ContactFormComponent as ContactFormComponent_1 } from '@tehw0lf/contact-form';
import { of } from 'rxjs';

import { ThemeService } from '../theme.service';

@Component({
  selector: 'tehw0lf-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
  standalone: true,
  imports: [ContactFormComponent_1]
})
export class ContactFormComponent {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiCallback = (formValue: any) => {
    // run logic and send to api, return true on success and false on failure
    // update sendErrorText input with error text for more verbose error message
    if (formValue.name) {
      return of(true);
    } else {
      return of(false);
    }
  };

  constructor(private themeService: ThemeService) {
    effect(() =>
      this.themeService.theme() === 'dark'
        ? this.switchToDark()
        : this.switchToLight()
    );
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
