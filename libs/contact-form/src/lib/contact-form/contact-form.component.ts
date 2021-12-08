import { Component, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { tap } from 'rxjs/operators';

import { EmailApiService } from '../email-api.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent {
  @Input() apiURL = '';

  formGroup: FormGroup;
  callResult = '';

  constructor(
    private builder: FormBuilder,
    private emailService: EmailApiService
  ) {
    this.formGroup = this.builder.group({
      from: new FormControl('', [Validators.required, Validators.email]),
      name: new FormControl('', [Validators.required]),
      subject: new FormControl(''),
      message: new FormControl('', [Validators.required])
    });
  }

  submitFormData(formData: FormGroup) {
    this.emailService
      .sendEmail(this.apiURL, formData.value)
      .pipe(
        tap((errorStatusText?: string) => {
          if (!errorStatusText) {
            this.callResult = 'E-Mail erfolgreich versendet!';
          } else {
            this.callResult = `Error: ${errorStatusText}`;
          }
        })
      )
      .subscribe();
  }
}
