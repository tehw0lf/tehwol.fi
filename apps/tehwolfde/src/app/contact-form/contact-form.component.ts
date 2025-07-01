import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ContactFormComponent as ContactFormComponent_1 } from '@tehw0lf/contact-form';
import { of } from 'rxjs';

import { ThemeService } from '../theme.service';

@Component({
    selector: 'tehw0lf-contact-form',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.scss'],
    imports: [ContactFormComponent_1],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactFormComponent {
  private themeService = inject(ThemeService);

  buttonStyle = computed(() => ({
    'background-color': this.themeService.theme() === 'dark' 
      ? '#333333' 
      : 'rgba(255, 255, 255, 0.75)',
    border: 'none',
    color: '#cc7832'
  }));

  formStyle = computed(() => ({
    color: '#437da8',
    'background-color': this.themeService.theme() === 'dark' 
      ? 'rgba(34, 34, 34, 0.75)' 
      : 'rgba(255, 255, 255, 0.75)',
    'backdrop-filter': 'blur(50px)',
    'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
  }));

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
}
