# WordlistGenerator

This project provides a wordlist generator using the cartesian product to combine custom character sets into a wordlist. It comes with a component and a service.

## Installation

### Peer Dependencies

The following dependencies are needed:

```bash
    @angular/animations
    @angular/cdk
    @angular/common
    @angular/core
    @angular/forms
    @angular/material
    @tehw0lf/mvc
```

### Module

If it's not added already, please run `ng add @angular/material` prior to adding this module.
Run `ng add @tehw0lf/wordlist-generator` in the workspace root of your angular application.

## Usage

The wordlist generator component just needs to be added by its tag:

```html
<wordlist-generator></wordlist-generator>
```

## Theming

The styles of form background, button, input and text can be customized with optional input parameters:

```ts
buttonStyle; /* {
    'background-color': '#333333',
    color: '#cc7832'
  }*/

dragStyle; // { color: '#cc7832' }

textStyle; // { color: '#cc7832' }
```

## Development

### Serve

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build wordlist-generator` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build (e.g. when building to publish to npm).

### Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io).

## Contributing

Contributions are welcome, although the library is still in an alpha stage. Feel free to open a PR and I'll have a look!
