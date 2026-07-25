import {
  getModelContext,
  isModelContextSupported,
  ModelContextTool,
  registerModelContextTools
} from './model-context';

interface Carrier {
  modelContext?: unknown;
}

function setDocumentContext(value: unknown): void {
  (document as unknown as Carrier).modelContext = value;
}

function setNavigatorContext(value: unknown): void {
  (navigator as unknown as Carrier).modelContext = value;
}

const tool: ModelContextTool<never> = {
  name: 'noop',
  description: 'test tool',
  execute: async () => 'ok'
} as ModelContextTool<never>;

describe('model context adapter', () => {
  afterEach(() => {
    delete (document as unknown as Carrier).modelContext;
    delete (navigator as unknown as Carrier).modelContext;
  });

  it('should report unsupported when neither location exists', () => {
    expect(isModelContextSupported()).toBe(false);
    expect(getModelContext()).toBeUndefined();
  });

  it('should prefer document.modelContext', () => {
    const fromDocument = { registerTool: jest.fn() };
    const fromNavigator = { registerTool: jest.fn() };
    setDocumentContext(fromDocument);
    setNavigatorContext(fromNavigator);

    expect(getModelContext()).toBe(fromDocument);
  });

  it('should fall back to the deprecated navigator location', () => {
    const fromNavigator = { registerTool: jest.fn() };
    setNavigatorContext(fromNavigator);

    expect(getModelContext()).toBe(fromNavigator);
    expect(isModelContextSupported()).toBe(true);
  });

  it('should be a no-op without browser support', async () => {
    const unregister = await registerModelContextTools([tool]);

    expect(typeof unregister).toBe('function');
    expect(() => unregister()).not.toThrow();
  });

  it('should register every tool and unregister via the abort signal', async () => {
    const registerTool = jest.fn().mockResolvedValue(undefined);
    setDocumentContext({ registerTool });

    const unregister = await registerModelContextTools([tool, tool]);

    expect(registerTool).toHaveBeenCalledTimes(2);
    const options = registerTool.mock.calls[0][1];
    expect(options.signal.aborted).toBe(false);

    unregister();
    expect(options.signal.aborted).toBe(true);
  });

  it('should survive a failing registration', async () => {
    const registerTool = jest
      .fn()
      .mockRejectedValue(new Error('nope'));
    setDocumentContext({ registerTool });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(registerModelContextTools([tool])).resolves.toBeDefined();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });
});
