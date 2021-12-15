// gpr-hack.js
const fs = require('fs');

contactFormFilePath = 'libs/contact-form/package.json';
gitPortfolioFilePath = 'libs/git-portfolio/package.json';
wordlistGeneratorFilePath = 'libs/wordlist-generator/package.json';

contactFormName = '@tehw0lf/contact-form';
gitPortfolioName = '@tehw0lf/git-portfolio';
wordlistGeneratorName = '@tehw0lf/wordlist-generator';

const contactFormFile = fs.readFileSync(contactFormFilePath, {
  encoding: 'utf-8'
});
const contactFormJson = JSON.parse(contactFormFile);
contactFormJson.name = contactFormName;

const gitPortfolioFile = fs.readFileSync(gitPortfolioFilePath, {
  encoding: 'utf-8'
});
const gitPortfolioJson = JSON.parse(gitPortfolioFile);
gitPortfolioJson.name = gitPortfolioName;

const wordlistGeneratorFile = fs.readFileSync(wordlistGeneratorFilePath, {
  encoding: 'utf-8'
});
const wordlistGeneratorJson = JSON.parse(wordlistGeneratorFile);
wordlistGeneratorJson.name = wordlistGeneratorName;

fs.writeFileSync(
  contactFormFilePath,
  JSON.stringify(contactFormJson, undefined, 2)
);

fs.writeFileSync(
  gitPortfolioFilePath,
  JSON.stringify(gitPortfolioJson, undefined, 2)
);

fs.writeFileSync(
  wordlistGeneratorFilePath,
  JSON.stringify(wordlistGeneratorJson, undefined, 2)
);
