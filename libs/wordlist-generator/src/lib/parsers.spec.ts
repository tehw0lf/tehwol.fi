import { toCSV, toPlaintext, toXML } from './parsers';

describe('Parsers', () => {
  describe('toPlaintext', () => {
    it('should return wordlist as is with text/plain content type', () => {
      const input = 'word1\nword2\nword3';
      const result = toPlaintext(input);

      expect(result.wordlist).toBe(input);
      expect(result.contentType).toBe('text/plain');
    });

    it('should handle empty wordlist', () => {
      const input = '';
      const result = toPlaintext(input);

      expect(result.wordlist).toBe('');
      expect(result.contentType).toBe('text/plain');
    });
  });

  describe('toXML', () => {
    it('should convert wordlist to XML format', () => {
      const input = 'word1\nword2\nword3';
      const result = toXML(input);

      expect(result.wordlist).toBe(
        '<wordlist><word>word1</word><word>word2</word><word>word3</word></wordlist>'
      );
      expect(result.contentType).toBe('text/xml');
    });

    it('should handle single word', () => {
      const input = 'singleword';
      const result = toXML(input);

      expect(result.wordlist).toBe(
        '<wordlist><word>singleword</word></wordlist>'
      );
      expect(result.contentType).toBe('text/xml');
    });

    it('should handle empty wordlist', () => {
      const input = '';
      const result = toXML(input);

      expect(result.wordlist).toBe('<wordlist><word></word></wordlist>');
      expect(result.contentType).toBe('text/xml');
    });

    it('should handle wordlist with multiple newlines', () => {
      const input = 'word1\n\nword2\nword3';
      const result = toXML(input);

      expect(result.wordlist).toBe(
        '<wordlist><word>word1</word><word></word><word>word2</word><word>word3</word></wordlist>'
      );
      expect(result.contentType).toBe('text/xml');
    });
  });

  describe('toCSV', () => {
    it('should convert wordlist to CSV format', () => {
      const input = 'word1\nword2\nword3';
      const result = toCSV(input);

      expect(result.wordlist).toBe('word1,word2,word3');
      expect(result.contentType).toBe('text/csv');
    });

    it('should handle single word', () => {
      const input = 'singleword';
      const result = toCSV(input);

      expect(result.wordlist).toBe('singleword');
      expect(result.contentType).toBe('text/csv');
    });

    it('should handle empty wordlist', () => {
      const input = '';
      const result = toCSV(input);

      expect(result.wordlist).toBe('');
      expect(result.contentType).toBe('text/csv');
    });

    it('should handle wordlist with multiple newlines', () => {
      const input = 'word1\n\nword2\nword3';
      const result = toCSV(input);

      expect(result.wordlist).toBe('word1,,word2,word3');
      expect(result.contentType).toBe('text/csv');
    });
  });
});
