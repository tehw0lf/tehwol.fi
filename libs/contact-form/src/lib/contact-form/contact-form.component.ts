import { Component, Input, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { EmailApiService } from '../email-api.service';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss']
})
export class ContactFormComponent implements OnDestroy {
  @Input() buttonStyle: string[] = [
    '"background-color": "#424242"',
    '"border": "1px solid #ced4da;"',
    'color: "#cc7832"'
  ];

  @Input() formStyle: string[] = [
    'color: "#437da8"',
    '"background-color": "rgba(34, 34, 34, 0.75)"',
    '"backdrop-filter": "blur(50px)"',
    '"box-shadow": "0 2px 10px rgba(0, 0, 0, 0.075)"'
  ];

  @Input() inputStyle: string[] = [
    'color: "#282b2e"',
    '"background-color": "#fff"',
    'border: "1px solid #ced4da"'
  ];

  @Input() textStyle: string[] = ['color: "#cc7832"'];

  @Input() apiURL = 'https://forwardmethis.com/';
  @Input() email = '';

  formGroup: FormGroup;
  emailSent: Subject<boolean | null> = new Subject();
  emailSent$ = this.emailSent.asObservable();

  private unsubscribe$: Subject<void> = new Subject();

  constructor(
    private builder: FormBuilder,
    private emailService: EmailApiService
  ) {
    this.emailSent.next(null);
    this.formGroup = this.builder.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', [Validators.required])
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitFormData(formData: FormGroup) {
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
