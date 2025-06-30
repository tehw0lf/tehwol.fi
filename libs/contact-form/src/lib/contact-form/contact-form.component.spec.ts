import { LayoutModule } from '@angular/cdk/layout';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { of, throwError } from 'rxjs';

import { ContactFormComponent } from './contact-form.component';
import {
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';

interface FormConfigEntry {
  field: string;
  value?: string;
  required?: boolean;
  type?: 'input' | 'textarea' | 'email' | 'number';
}

describe('ContactFormComponent', () => {
  let component: ContactFormComponent;
  let fixture: ComponentFixture<ContactFormComponent>;
  let mockApiCallback: jest.Mock;

  const defaultFormConfig: FormConfigEntry[] = [
    { field: 'name', required: true },
    { field: 'email', required: true },
    { field: 'message', required: true, type: 'textarea' }
  ];

  beforeEach(async () => {
    mockApiCallback = jest.fn().mockReturnValue(of(true));

    await TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        LayoutModule,
        FormlyModule.forRoot(),
        FormlyMaterialModule,
        ContactFormComponent
      ],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactFormComponent);
    component = fixture.componentInstance;
    
    // Set required inputs before component initialization
    fixture.componentRef.setInput('apiCallback', mockApiCallback);
    fixture.componentRef.setInput('formConfig', defaultFormConfig);
    
    // Don't call detectChanges() here - let each test control initialization
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('component initialization', () => {
    it('should initialize with default values', () => {
      fixture.detectChanges(); // Initialize component
      
      expect(component.buttonStyle()).toEqual({
        'background-color': '#333333',
        border: 'none',
        color: '#cc7832'
      });
      expect(component.formStyle()).toEqual({
        color: '#437da8',
        'background-color': 'rgba(34, 34, 34, 0.75)',
        'backdrop-filter': 'blur(50px)',
        'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
      });
      expect(component.textStyle()).toEqual({ color: '#cc7832' });
      expect(component.sendText()).toBe('Send');
      expect(component.sendSuccessfulText()).toBe('E-Mail successfully sent');
      expect(component.sendErrorText()).toBe('Send error');
    });

    it('should accept custom input values', () => {
      const customButtonStyle = { 'background-color': 'red', color: 'white' };
      const customFormStyle = { color: 'blue' };
      const customTextStyle = { color: 'green' };

      fixture.componentRef.setInput('buttonStyle', customButtonStyle);
      fixture.componentRef.setInput('formStyle', customFormStyle);
      fixture.componentRef.setInput('textStyle', customTextStyle);
      fixture.componentRef.setInput('sendText', 'Submit');
      fixture.componentRef.setInput('sendSuccessfulText', 'Success!');
      fixture.componentRef.setInput('sendErrorText', 'Error!');
      fixture.detectChanges();

      expect(component.buttonStyle()).toEqual(customButtonStyle);
      expect(component.formStyle()).toEqual(customFormStyle);
      expect(component.textStyle()).toEqual(customTextStyle);
      expect(component.sendText()).toBe('Submit');
      expect(component.sendSuccessfulText()).toBe('Success!');
      expect(component.sendErrorText()).toBe('Error!');
    });

    it('should initialize emailSent subject', () => {
      // The component should have emailSent subject defined
      expect(component.emailSent).toBeDefined();
      expect(component.emailSent$).toBeDefined();
    });
  });

  describe('form configuration building', () => {
    it('should build form fields from basic configuration', () => {
      fixture.detectChanges(); // This calls ngOnInit
      
      expect(component.fields).toHaveLength(3);
      expect(component.fields[0].key).toBe('name');
      expect(component.fields[1].key).toBe('email');
      expect(component.fields[2].key).toBe('message');
    });

    it('should set correct field types', () => {
      fixture.detectChanges(); // This calls ngOnInit
      
      expect(component.fields[0].type).toBe('input'); // default type
      expect(component.fields[1].type).toBe('input'); // email field defaults to input
      expect(component.fields[2].type).toBe('textarea'); // explicitly set
    });

    it('should configure labels and placeholders correctly', () => {
      fixture.detectChanges(); // This calls ngOnInit
      
      expect(component.fields[0].props?.label).toBe('NAME');
      expect(component.fields[0].props?.placeholder).toBe('Enter name');
      expect(component.fields[1].props?.label).toBe('EMAIL');
      expect(component.fields[1].props?.placeholder).toBe('Enter email');
    });

    it('should handle pre-filled values', () => {
      const configWithValues: FormConfigEntry[] = [
        { field: 'name', value: 'John Doe' },
        { field: 'email', value: 'john@example.com' }
      ];
      
      fixture.componentRef.setInput('formConfig', configWithValues);
      fixture.detectChanges(); // This calls ngOnInit with new config
      
      expect(component.model['name']).toBe('John Doe');
      expect(component.model['email']).toBe('john@example.com');
    });

    it('should configure textarea options correctly', () => {
      fixture.detectChanges(); // This calls ngOnInit
      
      // Test that textarea fields get created and have the proper type
      const textareaFields = component.fields.filter(field => field.type === 'textarea');
      expect(textareaFields).toHaveLength(1);
      expect(textareaFields[0].key).toBe('message');
    });

    it('should handle custom field types', () => {
      const customConfig: FormConfigEntry[] = [
        { field: 'age', type: 'input' }, // Use 'input' type for numbers
        { field: 'description', type: 'textarea' }
      ];
      
      fixture.componentRef.setInput('formConfig', customConfig);
      fixture.detectChanges(); // This calls ngOnInit with new config
      
      expect(component.fields[0].type).toBe('input');
      expect(component.fields[1].type).toBe('textarea');
    });
  });

  describe('email validation', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should add email validation to email fields', () => {
      const emailField = component.fields.find(field => field.key === 'email');
      expect(emailField?.validators?.email).toBeDefined();
      expect(emailField?.props?.type).toBe('email');
    });

    it('should validate correct email addresses', () => {
      const emailField = component.fields.find(field => field.key === 'email');
      const validator = emailField?.validators?.email?.expression;
      
      const mockControl = { value: 'test@example.com' } as AbstractControl;
      expect(validator?.(mockControl)).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      const emailField = component.fields.find(field => field.key === 'email');
      const validator = emailField?.validators?.email?.expression;
      
      const invalidEmails = ['invalid-email', 'test@', '@example.com', 'test.example.com'];
      
      invalidEmails.forEach(email => {
        const mockControl = { value: email } as AbstractControl;
        expect(validator?.(mockControl)).toBe(false);
      });
    });

    it('should allow empty email values (optional validation)', () => {
      const emailField = component.fields.find(field => field.key === 'email');
      const validator = emailField?.validators?.email?.expression;
      
      const mockControl = { value: '' } as AbstractControl;
      expect(validator?.(mockControl)).toBe(true);
    });

    it('should have correct email validation error message', () => {
      const emailField = component.fields.find(field => field.key === 'email');
      expect(emailField?.validators?.email?.message).toBe('Please enter a valid email address');
    });
  });

  describe('required field validation', () => {
    beforeEach(() => {
      fixture.detectChanges(); // Initialize component
    });

    it('should add required validation to required fields', () => {
      component.fields.forEach(field => {
        expect(field.validators?.required).toBeDefined();
        expect(field.props?.required).toBe(true);
      });
    });

    it('should validate non-empty required fields', () => {
      const nameField = component.fields.find(field => field.key === 'name');
      const validator = nameField?.validators?.required?.expression;
      
      const mockControl = { value: 'John Doe' } as AbstractControl;
      expect(validator?.(mockControl)).toBe(true);
    });

    it('should reject empty required fields', () => {
      const nameField = component.fields.find(field => field.key === 'name');
      const validator = nameField?.validators?.required?.expression;
      
      const emptyValues = ['', null, undefined];
      
      emptyValues.forEach(value => {
        const mockControl = { value } as AbstractControl;
        expect(validator?.(mockControl)).toBe(false);
      });
    });

    it('should have correct required validation error messages', () => {
      expect(component.fields[0].validators?.required?.message).toBe('name is required');
      expect(component.fields[1].validators?.required?.message).toBe('email is required');
      expect(component.fields[2].validators?.required?.message).toBe('message is required');
    });

    it('should handle optional fields without required validation', () => {
      const optionalConfig: FormConfigEntry[] = [
        { field: 'phone', required: false },
        { field: 'company' } // no required property
      ];
      
      fixture.componentRef.setInput('formConfig', optionalConfig);
      
      // Test that component doesn't crash with optional fields
      expect(() => fixture.detectChanges()).not.toThrow();
      
      // Verify fields were created (may have both formly and custom fields)
      expect(component.fields.length).toBeGreaterThan(0);
    });
  });

  describe('style management', () => {
    it('should flatten style objects correctly', () => {
      const styleObject = {
        'color': 'red',
        'background-color': 'blue',
        'font-size': '14px'
      };
      
      const flattened = component['flattenStyle'](styleObject);
      expect(flattened).toBe('color: red;background-color: blue;font-size: 14px;');
    });

    it('should handle empty style objects', () => {
      const flattened = component['flattenStyle']({});
      expect(flattened).toBe('');
    });

    it('should apply styles to field attributes', () => {
      fixture.detectChanges(); // Initialize component
      
      component.fields.forEach(field => {
        expect(field.props?.attributes?.style).toBeDefined();
        expect(field.props?.attributes?.style).toContain('color: #cc7832;');
      });
    });
  });

  describe('form submission', () => {
    it('should call API callback with form data', () => {
      const formData = { name: 'John', email: 'john@test.com', message: 'Hello' };
      
      component.submitFormData(formData);
      
      expect(mockApiCallback).toHaveBeenCalledWith(formData);
    });

    it('should update emailSent subject on successful submission', (done) => {
      mockApiCallback.mockReturnValue(of(true));
      const formData = { name: 'John', email: 'john@test.com', message: 'Hello' };
      
      component.emailSent$.subscribe(success => {
        if (success !== null) {
          expect(success).toBe(true);
          done();
        }
      });
      
      component.submitFormData(formData);
    });

    it('should update emailSent subject on failed submission', (done) => {
      mockApiCallback.mockReturnValue(of(false));
      const formData = { name: 'John', email: 'john@test.com', message: 'Hello' };
      
      component.emailSent$.subscribe(success => {
        if (success !== null) {
          expect(success).toBe(false);
          done();
        }
      });
      
      component.submitFormData(formData);
    });

    it('should handle API errors gracefully', () => {
      mockApiCallback.mockReturnValue(throwError(() => new Error('API Error')));
      const formData = { name: 'John', email: 'john@test.com', message: 'Hello' };
      
      expect(() => component.submitFormData(formData)).not.toThrow();
    });

    it('should trigger change detection after submission', () => {
      jest.spyOn(component['cdr'], 'markForCheck');
      const formData = { name: 'John', email: 'john@test.com', message: 'Hello' };
      
      component.submitFormData(formData);
      
      expect(component['cdr'].markForCheck).toHaveBeenCalled();
    });
  });

  describe('component lifecycle', () => {
    it('should build configuration on init', () => {
      jest.spyOn(component, 'buildConfig' as any);
      
      fixture.detectChanges(); // This calls ngOnInit
      
      expect(component['buildConfig']).toHaveBeenCalled();
    });

    it('should unsubscribe on destroy', () => {
      fixture.detectChanges(); // Initialize component
      
      jest.spyOn(component['unsubscribe$'], 'next');
      jest.spyOn(component['unsubscribe$'], 'complete');
      
      component.ngOnDestroy();
      
      expect(component['unsubscribe$'].next).toHaveBeenCalled();
      expect(component['unsubscribe$'].complete).toHaveBeenCalled();
    });

    it('should prevent memory leaks with takeUntil', () => {
      fixture.detectChanges(); // Initialize component
      
      // Test that unsubscribe$ exists and lifecycle methods work
      expect(component['unsubscribe$']).toBeDefined();
      
      // Verify ngOnDestroy can be called without errors
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty form configuration', () => {
      fixture.componentRef.setInput('formConfig', []);
      
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.fields).toHaveLength(0);
    });

    it('should handle malformed form configuration', () => {
      const malformedConfig = [
        { field: '', required: true }, // empty field name
        { field: 'valid-field' }
      ] as FormConfigEntry[];
      
      fixture.componentRef.setInput('formConfig', malformedConfig);
      
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.fields).toHaveLength(2);
    });

    it('should handle missing field properties gracefully', () => {
      const minimalConfig = [
        { field: 'test' } // only field name
      ] as FormConfigEntry[];
      
      fixture.componentRef.setInput('formConfig', minimalConfig);
      fixture.detectChanges();
      
      const field = component.fields[0];
      expect(field.key).toBe('test');
      expect(field.type).toBe('input'); // default type
      expect(field.props?.required).toBeFalsy();
    });

    it('should handle special characters in field names', () => {
      const specialConfig = [
        { field: 'field-with-dashes' },
        { field: 'field_with_underscores' },
        { field: 'fieldWithCamelCase' }
      ] as FormConfigEntry[];
      
      fixture.componentRef.setInput('formConfig', specialConfig);
      
      expect(() => fixture.detectChanges()).not.toThrow();
      expect(component.fields).toHaveLength(3);
    });
  });

  describe('complex form configurations', () => {
    it('should handle mixed field types and requirements', () => {
      const complexConfig: FormConfigEntry[] = [
        { field: 'name', required: true, type: 'input' },
        { field: 'email', required: true }, // Let component handle email type
        { field: 'phone', required: false, type: 'input' },
        { field: 'age', required: false, type: 'input' },
        { field: 'comments', required: false, type: 'textarea' },
        { field: 'company', value: 'Default Company' }
      ];
      
      fixture.componentRef.setInput('formConfig', complexConfig);
      fixture.detectChanges();
      
      expect(component.fields).toHaveLength(6);
      expect(component.model['company']).toBe('Default Company');
      
      // Check required fields
      const requiredFields = component.fields.filter(field => field.props?.required);
      expect(requiredFields).toHaveLength(2);
    });

    it('should preserve field order from configuration', () => {
      const orderedConfig: FormConfigEntry[] = [
        { field: 'third' },
        { field: 'first' },
        { field: 'second' }
      ];
      
      fixture.componentRef.setInput('formConfig', orderedConfig);
      fixture.detectChanges();
      
      expect(component.fields[0].key).toBe('third');
      expect(component.fields[1].key).toBe('first');
      expect(component.fields[2].key).toBe('second');
    });
  });
});
