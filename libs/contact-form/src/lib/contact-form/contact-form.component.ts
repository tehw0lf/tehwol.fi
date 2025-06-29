import { LayoutModule } from '@angular/cdk/layout';
import { AsyncPipe, NgStyle } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { Observable, Subject, takeUntil, tap } from 'rxjs';

interface FormValue {
  [key: string]: string;
}

interface FormConfigEntry {
  field: string;
  value?: string;
  required?: boolean;
  type?: 'input' | 'textarea' | 'email' | 'number';
}

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'contact-form',
    templateUrl: './contact-form.component.html',
    encapsulation: ViewEncapsulation.None,
    styleUrls: ['./contact-form.component.scss'],
    imports: [
        LayoutModule,
        ReactiveFormsModule,
        FormlyModule,
        FormlyMaterialModule,
        NgStyle,
        AsyncPipe
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactFormComponent implements OnInit, OnDestroy {
  private cdr = inject(ChangeDetectorRef);
  buttonStyle = input({
    'background-color': '#333333',
    border: 'none',
    color: '#cc7832'
  });

  formStyle = input({
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)',
    'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
  });

  textStyle = input({ color: '#cc7832' });

  sendText = input('Send');

  sendSuccessfulText = input('E-Mail successfully sent');

  sendErrorText = input('Send error');

  formConfig = input<FormConfigEntry[]>([
    { field: 'name', required: true },
    { field: 'email', required: true },
    { field: 'message', required: true, type: 'textarea' }
  ]);

  apiCallback = input.required<(formValue: FormValue) => Observable<boolean>>();

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
    this.apiCallback()(formData)
      .pipe(
        tap((success: boolean) => {
          this.emailSent.next(success);
          this.cdr.markForCheck();
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  private buildConfig(): void {
    this.formConfig().forEach((entry: FormConfigEntry) => {
      if (entry.value) {
        this.model[entry.field] = entry.value;
      }

      const fieldConfig: FormlyFieldConfig = {
        key: entry.field,
        type: entry.type ? entry.type : 'input',
        props: {
          label: entry.field.toLocaleUpperCase(),
          placeholder: 'Enter ' + entry.field,
          required: entry.required,
          attributes: { style: this.flattenStyle(this.textStyle()) }
        },
        templateOptions:
          entry.type === 'textarea'
            ? {
                autosize: true,
                minRows: 5,
                maxRows: 10
              }
            : {}
      };

      // Add email validation for email fields
      if (entry.field.toLowerCase() === 'email') {
        if (fieldConfig.props) {
          fieldConfig.props.type = 'email';
        }
        fieldConfig.validators = {
          email: {
            expression: (control: AbstractControl) => !control.value || /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(control.value),
            message: 'Please enter a valid email address'
          }
        };
      }

      // Add required validation message
      if (entry.required) {
        fieldConfig.validators = {
          ...fieldConfig.validators,
          required: {
            expression: (control: AbstractControl) => !!control.value,
            message: `${entry.field} is required`
          }
        };
      }

      this.fields.push(fieldConfig);
    });
  }

  private flattenStyle(styleObject: { [key: string]: string }): string {
    return Object.entries(styleObject)
      .flatMap((entry) => {
        return `${entry[0]}: ${entry[1]};`;
      })
      .join('');
  }
}
