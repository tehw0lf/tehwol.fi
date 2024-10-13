export const toPlaintext = (
  wordlist: string
): { wordlist: string; contentType: string } => ({
  wordlist,
  contentType: 'text/plain'
});

export const toXML = (
  wordlist: string
): { wordlist: string; contentType: string } => {
  const head = '<wordlist><word>';
  const glue = '</word><word>';
  const tail = '</word></wordlist>';
  return {
    wordlist: head + wordlist.replace(/\n/g, glue) + tail,
    contentType: 'text/xml'
  };
};

export const toCSV = (
  wordlist: string
): { wordlist: string; contentType: string } => {
  const glue = ',';
  return {
    wordlist: wordlist.replace(/\n/g, glue),
    contentType: 'text/csv'
  };
};
