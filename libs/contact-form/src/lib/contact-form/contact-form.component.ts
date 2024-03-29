import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EmailApiService } from '../email-api.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-form',
  templateUrl: './contact-form.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnDestroy {
  @Input() buttonStyle = {
    'background-color': '#333333',
    border: 'none',
    color: '#cc7832'
  };

  @Input() formStyle = {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)',
    'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
  };

  @Input() inputStyle = {
    color: '#282b2e'
  };

  @Input() textStyle = { color: '#cc7832' };

  @Input() nameLabel = 'Your Name';

  @Input() emailAddressLabel = 'Your E-Mail Address';

  @Input() messageLabel = 'Your Message';

  @Input() sendText = 'Send';

  @Input() sendSuccessfulText = 'E-Mail successfully sent';

  @Input() sendErrorText = 'Send error';

  @Input() apiURL = 'https://forwardmethis.com/';
  @Input() email = '';

  formGroup: UntypedFormGroup;
  emailSent: Subject<boolean | null> = new Subject();
  emailSent$ = this.emailSent.asObservable();

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private builder: UntypedFormBuilder,
    private emailService: EmailApiService
  ) {
    this.emailSent.next(null);
    this.formGroup = this.builder.group({
      name: new UntypedFormControl('', [Validators.required]),
      email: new UntypedFormControl('', [Validators.required, Validators.email]),
      message: new UntypedFormControl('', [Validators.required])
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitFormData(formData: UntypedFormGroup) {
    this.emailService
      .sendEmail(`${this.apiURL}${this.email}`, formData.value)
      .pipe(
        tap((response: string) => {
          if (response === 'OK') {
            this.emailSent.next(true);
          } else {
            this.emailSent.next(false);
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }
}
