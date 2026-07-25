import { FormControl, FormGroup, Validators } from '@angular/forms';

import { createContactFormTools } from './contact-form-tools';
import { ModelContextTool } from './model-context';

function buildForm(): FormGroup {
  return new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required)
  });
}

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
    tools = createContactFormTools({ form });
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
