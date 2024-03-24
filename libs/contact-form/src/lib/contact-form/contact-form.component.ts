import { LayoutModule } from '@angular/cdk/layout';
import { AsyncPipe, NgStyle } from '@angular/common';
import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import {
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'contact-form',
  templateUrl: './contact-form.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./contact-form.component.scss'],
  standalone: true,
  imports: [
    LayoutModule,
    ReactiveFormsModule,
    NgStyle,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe
  ]
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() apiCallback!: (formValue: any) => Observable<boolean>;

  formGroup: UntypedFormGroup;
  emailSent: Subject<boolean | null> = new Subject();
  emailSent$ = this.emailSent.asObservable();

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private builder: UntypedFormBuilder) {
    this.emailSent.next(null);
    this.formGroup = this.builder.group({
      name: new UntypedFormControl('', [Validators.required]),
      email: new UntypedFormControl('', [
        Validators.required,
        Validators.email
      ]),
      message: new UntypedFormControl('', [Validators.required])
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitFormData(formData: UntypedFormGroup) {
    this.apiCallback(formData.value)
      .pipe(
        tap((success: boolean) => this.emailSent.next(success)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }
}
