/**
 * Minimal typing and access layer for the WebMCP browser API.
 *
 * WebMCP is a W3C Community Group draft (not on the standards track) and the
 * global it lives on has already moved twice: `window.agent`, then
 * `navigator.modelContext`, and since the 21 July 2026 draft
 * `document.modelContext`. Chrome 150 deprecated the navigator location but
 * still exposes it as an alias.
 *
 * Every access goes through `getModelContext()` so a further move only has to
 * be handled here instead of in each tool.
 */

/** Result an agent receives back from a tool call. */
export type ModelContextToolResult = string | Record<string, unknown>;

export interface ModelContextToolAnnotations {
  /** The tool only reads state and is safe to call speculatively. */
  readOnlyHint?: boolean;
  /** The tool returns content that originates from outside this page. */
  untrustedContentHint?: boolean;
}

export interface ModelContextTool<TInput = Record<string, unknown>> {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  annotations?: ModelContextToolAnnotations;
  execute: (input: TInput) => Promise<ModelContextToolResult>;
}

export interface ModelContextRegisterOptions {
  /** Aborting the signal unregisters the tool again. */
  signal?: AbortSignal;
}

export interface ModelContext {
  registerTool(
    tool: ModelContextTool<never>,
    options?: ModelContextRegisterOptions
  ): Promise<void>;
}

interface ModelContextCarrier {
  modelContext?: ModelContext;
}

/**
 * Returns the ModelContext of the current document, or undefined when the
 * browser does not implement WebMCP. Prefers the current `document` location
 * and falls back to the deprecated `navigator` alias.
 */
export function getModelContext(): ModelContext | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const fromDocument = (document as unknown as ModelContextCarrier)
    .modelContext;
  if (fromDocument) {
    return fromDocument;
  }

  if (typeof navigator === 'undefined') {
    return undefined;
  }

  return (navigator as unknown as ModelContextCarrier).modelContext;
}

/** True when this browser exposes the WebMCP API. */
export function isModelContextSupported(): boolean {
  return getModelContext() !== undefined;
}

/**
 * Registers tools if the browser supports WebMCP, otherwise resolves without
 * doing anything. Returns a function that unregisters them again.
 *
 * Registration mutates global browser state, so libraries must never call this
 * on their own; it is opt-in for the embedding application.
 */
export async function registerModelContextTools(
  tools: readonly ModelContextTool<never>[]
): Promise<() => void> {
  const modelContext = getModelContext();
  if (!modelContext) {
    return () => undefined;
  }

  const controller = new AbortController();

  await Promise.all(
    tools.map((tool) =>
      modelContext
        .registerTool(tool, { signal: controller.signal })
        .catch((error: unknown) => {
          // Tool names come from the caller, so they are passed as arguments
          // rather than interpolated: a name containing a format specifier
          // would otherwise consume the error and forge the log line.
          console.warn('WebMCP: registering tool failed:', tool.name, error);
        })
    )
  );

  return () => controller.abort();
}
