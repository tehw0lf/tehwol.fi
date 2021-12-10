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
  @Input() apiURL = 'https://forwardmethis.com/tehwolf@pm.me';

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
      .sendEmail(this.apiURL, formData.value)
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
