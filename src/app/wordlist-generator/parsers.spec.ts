import { toPlaintext, toXML } from './parsers';

const plaintextSample = '13\n23\n14\n24';
const xmlSample =
  '<wordlist><word>13</word><word>23</word><word>14</word><word>24</word></wordlist>';

describe('Parsers', () => {
  let wordlist;

  beforeEach(() => {
    wordlist = ['13', '23', '14', '24'];
  });

  it('should parse a wordlist to plain text', () => {
    const result = toPlaintext(wordlist);

    expect(JSON.stringify(result.wordlist)).toEqual(
      JSON.stringify(plaintextSample)
    );
    expect(result.contentType).toEqual('text/plain');
  });

  it('should parse a wordlist to XML', () => {
    const result = toXML(wordlist);

    expect(result.wordlist).toEqual(xmlSample);
    expect(result.contentType).toEqual('text/xml');
  });
});
