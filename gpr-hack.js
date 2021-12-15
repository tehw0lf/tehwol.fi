// gpr-hack.js
import { readFileSync, writeFileSync } from 'fs';

contactFormFilePath = 'libs/contact-form/package.json';
gitPortfolioFilePath = 'libs/git-portfolio/package.json';
wordlistGeneratorFilePath = 'libs/wordlist-generator/package.json';

contactFormName = '@tehw0lf/contact-form';
gitPortfolioName = '@tehw0lf/git-portfolio';
wordlistGeneratorName = '@tehw0lf/wordlist-generator';

const contactFormFile = readFileSync(contactFormFilePath, {
  encoding: 'utf-8'
});
const contactFormJson = JSON.parse(contactFormFile);
contactFormJson.name = contactFormName;

const gitPortfolioFile = readFileSync(gitPortfolioFilePath, {
  encoding: 'utf-8'
});
const gitPortfolioJson = JSON.parse(gitPortfolioFile);
gitPortfolioJson.name = gitPortfolioName;

const wordlistGeneratorFile = readFileSync(wordlistGeneratorFilePath, {
  encoding: 'utf-8'
});
const wordlistGeneratorJson = JSON.parse(wordlistGeneratorFile);
wordlistGeneratorJson.name = wordlistGeneratorName;

writeFileSync(
  contactFormFilePath,
  JSON.stringify(contactFormJson, undefined, 2)
);

writeFileSync(
  gitPortfolioFilePath,
  JSON.stringify(gitPortfolioJson, undefined, 2)
);

writeFileSync(
  wordlistGeneratorFilePath,
  JSON.stringify(wordlistGeneratorJson, undefined, 2)
);
