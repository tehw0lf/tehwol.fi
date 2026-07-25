import {
  wordlistCountTool,
  wordlistGenerateTool
} from './wordlist-tools';

interface GenerateResult {
  words: string[];
  returned: number;
  total: number;
  truncated: boolean;
}

interface CountResult {
  total: number;
  charsetLengths: number[];
  exceedsSingleCallLimit: boolean;
}

async function generate(input: {
  charsets: string[];
  limit?: number;
}): Promise<GenerateResult> {
  return (await wordlistGenerateTool.execute(input)) as unknown as GenerateResult;
}

async function count(charsets: string[]): Promise<CountResult> {
  return (await wordlistCountTool.execute({
    charsets
  })) as unknown as CountResult;
}

describe('wordlist webmcp tools', () => {
  describe('wordlist_count', () => {
    it('should multiply the charset lengths', async () => {
      const result = await count(['abc', '12']);

      expect(result.total).toBe(6);
      expect(result.charsetLengths).toEqual([3, 2]);
      expect(result.exceedsSingleCallLimit).toBe(false);
    });

    it('should flag counts above the single call limit', async () => {
      const result = await count(['abcdefghij', 'abcdefghij', 'abcdefghij', 'abcdefghij', 'abcdefghij']);

      expect(result.total).toBe(100000);
      expect(result.exceedsSingleCallLimit).toBe(true);
    });
  });

  describe('wordlist_generate', () => {
    it('should return the full product when it fits', async () => {
      // Word contents and their order are covered by the service spec; this
      // only checks what the tool layer adds on top.
      const result = await generate({ charsets: ['ab', '12'] });

      expect(result.words.length).toBe(4);
      expect(result.returned).toBe(4);
      expect(result.total).toBe(4);
      expect(result.truncated).toBe(false);
    });

    it('should cap the output and report truncation', async () => {
      const result = await generate({ charsets: ['abcdefghij', 'abcdefghij'], limit: 10 });

      expect(result.words.length).toBe(10);
      expect(result.returned).toBe(10);
      expect(result.total).toBe(100);
      expect(result.truncated).toBe(true);
    });

    it('should never exceed the hard cap even when asked to', async () => {
      const result = await generate({
        charsets: ['abcdefghij', 'abcdefghij', 'abcdefghij', 'abcdefghij', 'abcdefghij'],
        limit: 999999
      });

      // A cartesian product this size would otherwise stall the agent.
      expect(result.words.length).toBe(10000);
      expect(result.truncated).toBe(true);
    });

    it('should reject invalid charsets', async () => {
      await expect(generate({ charsets: [] })).rejects.toThrow(
        'non-empty array'
      );
      await expect(
        generate({ charsets: ['ab', ''] })
      ).rejects.toThrow('index 1');
      await expect(
        generate({ charsets: Array.from({ length: 17 }, () => 'ab') })
      ).rejects.toThrow('more than 16');
    });

    it('should be annotated as read only', () => {
      expect(wordlistGenerateTool.annotations?.readOnlyHint).toBe(true);
      expect(wordlistCountTool.annotations?.readOnlyHint).toBe(true);
    });
  });
});
