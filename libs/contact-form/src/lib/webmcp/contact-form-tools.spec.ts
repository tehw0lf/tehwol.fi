import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { createContactFormTools } from './contact-form-tools';
import { ModelContextTool } from './model-context';

/**
 * Mirrors how ContactFormComponent actually builds its controls: ngx-formly
 * applies required as a validator expression, not as Validators.required. A
 * fixture using Validators.required would let hasValidator() based code pass
 * here while reporting nothing on the real form.
 */
const requiredExpression = (control: AbstractControl) =>
  control.value ? null : { required: true };

function buildForm(): FormGroup {
  return new FormGroup({
    name: new FormControl('', requiredExpression),
    email: new FormControl('', requiredExpression),
    message: new FormControl('', requiredExpression)
  });
}

const REQUIRED_FIELDS = ['name', 'email', 'message'] as const;

function toolByName(
  tools: readonly ModelContextTool<never>[],
  name: string
): ModelContextTool<never> {
  const tool = tools.find((candidate) => candidate.name === name);
  if (!tool) {
    throw new Error(`tool ${name} not registered`);
  }
  return tool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(tool: ModelContextTool<never>, input: any): Promise<any> {
  return tool.execute(input);
}

describe('contact form webmcp tools', () => {
  let form: FormGroup;
  let tools: readonly ModelContextTool<never>[];

  beforeEach(() => {
    form = buildForm();
    tools = createContactFormTools({
      form,
      requiredFields: REQUIRED_FIELDS
    });
  });

  it('should keep reporting a field as required once it is filled', async () => {
    form.patchValue({ name: 'Ada' });

    const result = await run(toolByName(tools, 'contact_form_describe'), {});
    const name = result.fields.find(
      (field: { name: string }) => field.name === 'name'
    );

    // The 'required' error clears as soon as a value is present, so deriving
    // this from the control state would wrongly report required: false.
    expect(name.filled).toBe(true);
    expect(name.valid).toBe(true);
    expect(name.required).toBe(true);
  });

  it('should report fields outside the required list as optional', async () => {
    const withOptional = createContactFormTools({
      form: new FormGroup({
        name: new FormControl('', requiredExpression),
        company: new FormControl('')
      }),
      requiredFields: ['name']
    });

    const result = await run(
      toolByName(withOptional, 'contact_form_describe'),
      {}
    );

    expect(
      result.fields.map((f: { name: string; required: boolean }) => [
        f.name,
        f.required
      ])
    ).toEqual([
      ['name', true],
      ['company', false]
    ]);
  });

  it('should describe the available fields', async () => {
    const result = await run(toolByName(tools, 'contact_form_describe'), {});

    expect(result.fields.map((f: { name: string }) => f.name)).toEqual([
      'name',
      'email',
      'message'
    ]);
    expect(result.formValid).toBe(false);
  });

  it('should prefill the given fields', async () => {
    const result = await run(toolByName(tools, 'contact_form_prefill'), {
      fields: { name: 'Ada', message: 'Hi' }
    });

    expect(form.get('name')?.value).toBe('Ada');
    expect(form.get('message')?.value).toBe('Hi');
    expect(result.prefilled).toEqual(['name', 'message']);
  });

  it('should never submit the form', async () => {
    // The tools must not expose any way to send the message.
    expect(tools.map((tool) => tool.name)).toEqual([
      'contact_form_describe',
      'contact_form_prefill'
    ]);

    const result = await run(toolByName(tools, 'contact_form_prefill'), {
      fields: { name: 'Ada', email: 'ada@example.com', message: 'Hi' }
    });

    expect(result.submitted).toBe(false);
    // Even a fully valid form stays unsent; sending is a user action.
    expect(result.formValid).toBe(true);
  });

  it('should reject unknown fields', async () => {
    await expect(
      run(toolByName(tools, 'contact_form_prefill'), {
        fields: { nope: 'x' }
      })
    ).rejects.toThrow('unknown field "nope"');
  });

  it('should reject non string and oversized values', async () => {
    await expect(
      run(toolByName(tools, 'contact_form_prefill'), { fields: { name: 42 } })
    ).rejects.toThrow('must be a string');

    await expect(
      run(toolByName(tools, 'contact_form_prefill'), {
        fields: { message: 'x'.repeat(5001) }
      })
    ).rejects.toThrow('exceeds 5000');
  });
});
