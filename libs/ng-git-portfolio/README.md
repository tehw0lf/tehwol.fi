# NgGitPortfolio

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
    @angular/flex-layout
    @angular/material
    @primer/octicons
    github-language-colors
```

### Module

Run `ng add @tehw0lf/ng-git-portfolio` in the workspace root of your angular application.
In app.module.ts, import NgGitPortfolioModule and add it to the module's import section:

```ts
import { NgGitPortfolioModule } from '../../../ng-git-portfolio/src/public-api';

@NgModule({
    ...
  imports: [
      ...
    NgGitPortfolioModule
  ],
  ...
})
export class AppModule {}
```

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
<ng-git-portfolio [gitProviderConfig]="gitProviderConfig"></ng-git-portfolio>
```

## Generate a sample component

Run `ng generate ng-git-portfolio:git-portfolio-component --name=test` to generate a component named "test" in the default application.

## Theming

At the moment there is only a dark theme. A light theme will be added in the future.

## Development

### Serve

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build ng-git-portfolio` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build (e.g. when building to publish to npm).

### Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io).

## To Do

Expand schematic to add module entry
Install dependencies automatically

## Contributing

Contributions are welcome, although the library is still in an alpha stage. Feel free to open a PR and I'll have a look!
