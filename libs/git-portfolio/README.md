# GitPortfolio

This project provides a minimalistic git portfolio component which displays repositories for a configurable user. Currently supporting GitHub and GitLab.

![demo](https://user-images.githubusercontent.com/15650679/105714749-09522200-5f1d-11eb-9d29-11e526d6a02c.png)

## Installation

### Peer Dependencies

The following dependencies are needed:

```bash
    @angular/animations
    @angular/cdk
    @angular/common
    @angular/core
    @angular/material
    @primer/octicons
    @tehw0lf/mvc
    github-language-colors
```

### Module

If it's not added already, please run `ng add @angular/material` prior to adding this module.
Run `ng add @tehw0lf/git-portfolio` in the workspace root of your angular application.

## Usage

The portfolio component takes a configuration as input. This configuration is a simple JS Object which holds usernames for the available git providers:

```ts
gitProviderConfig = {
  github: 'githubUsername',
  gitlab: 'gitlabUsername'
};
```

Then, in the template, the portfolio can be added by its tag:

```html
<git-portfolio [gitProviderConfig]="gitProviderConfig"></git-portfolio>
```

In addition to the git provider configuration, the types of repositories displayed can be customized with optional input parameters:

```ts
showForked; //display forked repositories. default: true
showOwn; //display own repositories. default: true
```

## Theming

The styles of card background, button and text as well as the octicon colors can be customized with optional input parameters:

```ts
buttonStyle; // { 'background-color': '#424242', color: '#cc7832' }
cardStyle; /* {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)'
  }*/
textStyle; //default: { color: '#437da8' };
checkColor; //default: '#38e038';
forkColor; //default: '#437da8';
issueColor; //default: 'rgb(56, 224, 56)';
pasteColor; //default: '#cc7832';
starColor; //default: 'gold';
```

## Development

### Serve

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build git-portfolio` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build (e.g. when building to publish to npm).

### Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io).

## Contributing

Contributions are welcome, although the library is still in an alpha stage. Feel free to open a PR and I'll have a look!
