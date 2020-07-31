export const toPlaintext = (
  wordlist: string[]
): { wordlist: string; contentType: string } => ({
  wordlist: wordlist.toString().replace(/,/g, '\n'),
  contentType: 'text/plain'
});

export const toXML = (
  wordlist: string[]
): { wordlist: string; contentType: string } => {
  const head = '<wordlist><word>';
  const glue = '</word><word>';
  const tail = '</word></wordlist>';
  return {
    wordlist: head + wordlist.toString().replace(/,/g, glue) + tail,
    contentType: 'text/xml'
  };
};
