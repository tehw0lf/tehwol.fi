import { LayoutModule } from '@angular/cdk/layout';
import { AsyncPipe, NgStyle } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

interface FormConfigEntry {
  field: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  required?: boolean;
}

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
    FormlyModule,
    NgStyle,
    MatFormFieldModule,
    MatInputModule,
    AsyncPipe
  ]
})
export class ContactFormComponent implements OnInit, OnDestroy {
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

  @Input() sendText = 'Send';

  @Input() sendSuccessfulText = 'E-Mail successfully sent';

  @Input() sendErrorText = 'Send error';

  @Input() formConfig: FormConfigEntry[] = [
    { field: 'name', required: true },
    { field: 'email', required: true },
    { field: 'message', required: true }
  ];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() apiCallback!: (formValue: any) => Observable<boolean>;

  form = new FormGroup({});
  fields: FormlyFieldConfig[] = [];
  model: { [key: string]: string } = {};

  emailSent: Subject<boolean | null> = new Subject();
  emailSent$ = this.emailSent.asObservable();

  private unsubscribe$: Subject<void> = new Subject();

  constructor() {
    this.emailSent.next(null);
  }

  ngOnInit(): void {
    this.buildConfig();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  submitFormData(formData: { [key: string]: string }) {
    this.apiCallback(formData)
      .pipe(
        tap((success: boolean) => this.emailSent.next(success)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  private buildConfig(): void {
    this.formConfig.forEach((entry: FormConfigEntry) => {
      if (entry.value) {
        this.model[entry.field] = entry.value;
      }
      this.fields.push({
        key: entry.field,
        type: 'input',
        props: {
          label: entry.field.toLocaleUpperCase(),
          placeholder: 'Enter ' + entry.field,
          required: true
        }
      });
    });
  }
}
