import { product } from 'cartesian-product-generator';

import { ModelContextTool } from './model-context';

/**
 * A cartesian product grows multiplicatively, so an unbounded tool call can
 * produce millions of words and stall the calling agent. Results are always
 * capped and the response says so explicitly.
 *
 * These tools iterate the generator directly rather than going through
 * WordlistGeneratorService: the service streams every word and offloads large
 * sets to a web worker, whereas a capped tool call stops after at most
 * MAX_LIMIT words. Leaving the generator early means the remainder is never
 * computed, which a worker based run cannot offer.
 */
const DEFAULT_LIMIT = 1000;
const MAX_LIMIT = 10000;
const MAX_CHARSETS = 16;

export interface WordlistGenerateInput {
  charsets: string[];
  limit?: number;
}

export interface WordlistCountInput {
  charsets: string[];
}

function assertCharsets(charsets: unknown): string[] {
  if (!Array.isArray(charsets) || !charsets.length) {
    throw new Error('charsets must be a non-empty array of strings');
  }

  if (charsets.length > MAX_CHARSETS) {
    throw new Error(`charsets must not contain more than ${MAX_CHARSETS} entries`);
  }

  return charsets.map((charset, index) => {
    if (typeof charset !== 'string' || !charset.length) {
      throw new Error(`charset at index ${index} must be a non-empty string`);
    }
    return charset;
  });
}

function countCombinations(charsets: string[]): number {
  return charsets.reduce((total, charset) => total * charset.length, 1);
}

/**
 * Reports how many words a set of charsets would produce, so an agent can
 * decide whether generating them is worthwhile before asking for the words.
 */
export const wordlistCountTool: ModelContextTool<WordlistCountInput> = {
  name: 'wordlist_count',
  title: 'Count wordlist combinations',
  description:
    'Calculates how many words the cartesian product of the given character sets would produce, without generating them. Use this before wordlist_generate to check the size.',
  inputSchema: {
    type: 'object',
    properties: {
      charsets: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: MAX_CHARSETS,
        description:
          'One character set per position, e.g. ["abc", "12"] yields a1, a2, b1, b2, c1, c2.'
      }
    },
    required: ['charsets']
  },
  annotations: { readOnlyHint: true },
  execute: async ({ charsets }) => {
    const validated = assertCharsets(charsets);
    const total = countCombinations(validated);

    return {
      total,
      charsetLengths: validated.map((charset) => charset.length),
      exceedsSingleCallLimit: total > MAX_LIMIT
    };
  }
};

/**
 * Generates the cartesian product of the given charsets, capped so a single
 * call can never return an unbounded amount of text.
 */
export const wordlistGenerateTool: ModelContextTool<WordlistGenerateInput> = {
  name: 'wordlist_generate',
  title: 'Generate a wordlist',
  description:
    'Generates words by combining one character from each given character set (cartesian product). Results are capped; call wordlist_count first to learn the full size.',
  inputSchema: {
    type: 'object',
    properties: {
      charsets: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: MAX_CHARSETS,
        description:
          'One character set per position, e.g. ["abc", "12"] yields a1, a2, b1, b2, c1, c2.'
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: MAX_LIMIT,
        description: `Maximum number of words to return (default ${DEFAULT_LIMIT}, hard cap ${MAX_LIMIT}).`
      }
    },
    required: ['charsets']
  },
  annotations: { readOnlyHint: true },
  execute: async ({ charsets, limit }) => {
    const validated = assertCharsets(charsets);
    const cap = Math.min(
      Math.max(Math.floor(limit ?? DEFAULT_LIMIT), 1),
      MAX_LIMIT
    );

    const total = countCombinations(validated);
    const words: string[] = [];

    for (const combination of product(...validated)) {
      words.push((combination as string[]).join(''));
      if (words.length >= cap) {
        break;
      }
    }

    return {
      words,
      returned: words.length,
      total,
      truncated: words.length < total
    };
  }
};

/** All tools this library contributes. */
export const wordlistGeneratorTools: readonly ModelContextTool<never>[] = [
  wordlistCountTool as ModelContextTool<never>,
  wordlistGenerateTool as ModelContextTool<never>
];
