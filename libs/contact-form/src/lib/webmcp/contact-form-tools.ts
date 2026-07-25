import { FormGroup } from '@angular/forms';

import { ModelContextTool } from './model-context';

/**
 * A tool that could submit the form would let an agent send mail on a
 * visitor's behalf, which is a spam vector. These tools therefore only ever
 * fill fields in and report the state back; pressing send stays a human
 * action.
 */
export interface ContactFormToolTarget {
  /** The form group rendered by ContactFormComponent. */
  form: FormGroup;
  /**
   * The component's formConfig, which is what actually declares whether a
   * field is required.
   *
   * The control state cannot answer this: ngx-formly expresses required as a
   * validator expression rather than Validators.required, so hasValidator()
   * misses it, and errors['required'] disappears as soon as the field is
   * filled. Fields absent from the config are reported as not required.
   */
  requiredFields?: readonly string[];
}

const MAX_VALUE_LENGTH = 5000;

function describeControls(form: FormGroup): string[] {
  return Object.keys(form.controls);
}

function assertFields(
  fields: unknown,
  form: FormGroup
): Record<string, string> {
  if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
    throw new Error('fields must be an object of control name to value');
  }

  const known = new Set(describeControls(form));
  const result: Record<string, string> = {};

  Object.entries(fields as Record<string, unknown>).forEach(([key, value]) => {
    if (!known.has(key)) {
      throw new Error(
        `unknown field "${key}", available fields: ${[...known].join(', ')}`
      );
    }
    if (typeof value !== 'string') {
      throw new Error(`value for "${key}" must be a string`);
    }
    if (value.length > MAX_VALUE_LENGTH) {
      throw new Error(
        `value for "${key}" exceeds ${MAX_VALUE_LENGTH} characters`
      );
    }
    result[key] = value;
  });

  return result;
}

/**
 * Creates the contact form tools for a concrete rendered form.
 *
 * @param target the form group to describe and prefill
 */
export function createContactFormTools(
  target: ContactFormToolTarget
): readonly ModelContextTool<never>[] {
  const describeTool: ModelContextTool<Record<string, never>> = {
    name: 'contact_form_describe',
    title: 'Describe the contact form',
    description:
      'Lists the fields of the contact form on this page, whether they are currently valid and what is already filled in.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const { form, requiredFields } = target;
      const required = new Set(requiredFields ?? []);

      return {
        fields: describeControls(form).map((name) => {
          const control = form.get(name);
          return {
            name,
            filled: Boolean(control?.value),
            valid: control?.valid ?? false,
            required: required.has(name)
          };
        }),
        formValid: form.valid
      };
    }
  };

  const prefillTool: ModelContextTool<{ fields: Record<string, string> }> = {
    name: 'contact_form_prefill',
    title: 'Prefill the contact form',
    description:
      'Fills fields of the contact form on this page so the user can review them. This never sends the message; the user has to press send themselves.',
    inputSchema: {
      type: 'object',
      properties: {
        fields: {
          type: 'object',
          description:
            'Map of field name to value. Call contact_form_describe first to learn the available field names.',
          additionalProperties: { type: 'string' }
        }
      },
      required: ['fields']
    },
    // Not read-only: it changes what the user sees in the form.
    annotations: { readOnlyHint: false },
    execute: async ({ fields }) => {
      const { form } = target;
      const validated = assertFields(fields, form);

      form.patchValue(validated);
      form.markAsDirty();

      return {
        prefilled: Object.keys(validated),
        formValid: form.valid,
        submitted: false,
        note: 'The form was filled in only. The user still has to press send.'
      };
    }
  };

  return [
    describeTool as unknown as ModelContextTool<never>,
    prefillTool as unknown as ModelContextTool<never>
  ];
}
