# contact-form

This provides a simple way to let your users contact you.

## Installation

### Peer Dependencies

The following dependencies are needed:

```bash
    @angular/animations
    @angular/common
    @angular/core
    @angular/forms
    @ngx-formly/core
    @ngx-formly/material
```

### Module

If it's not added already, please run `ng add @angular/material` prior to adding this module.
Run `ng add @tehw0lf/contact-form` in the workspace root of your angular application.

## Usage

The contact form component takes an apiCallback returning a boolean Observable as mandatory input. By default, this is set to a dummy function that returns true if the form's value contains a name and false if not. A more verbose error message can be provided by updating sendErrorMessage with the error message dynamically from the callback.

A form can be generated from an arbitrary model. By default, the form contains name, email and message fields.

```html
<contact-form [apiCallback]="apiCallback"></contact-form>
```

In your component, set the `apiCallback` property. The naming of these variables is arbitrary:

```ts
// eslint-disable-next-line @typescript-eslint/no-explicit-any
apiCallback = (formValue: any) => {
  // run logic and send to api, return true on success and false on failure
  // update sendErrorText input with error text for more verbose error message
  if (formValue.name) {
    return of(true);
  } else {
    return of(false);
  }
};
```

On submitting the form, your API callback will be executed. The status will be reflected by a message that can be overridden by setting `sendErrorText` and `sendSuccessfulText`.

## Form Generation

In order to generate the form, a config array can be provided. By default, the config array contains name, email and message fields without default values.

```ts
interface FormConfigEntry {
  field: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  required?: boolean;
  type?: string;
}

formConfig: FormConfigEntry[] = [
    { field: 'name', required: true },
    { field: 'email', required: true },
    { field: 'message', required: true, type: 'textarea' }
  ];
```

## Text

The message texts can optionally be specified.

```ts
sendSuccessfulText; //'E-Mail successfully sent';

sendErrorText; //'Send error';
```

## Theming

The styles of form background, button and text can be customized with optional input parameters:

```ts
buttonStyle; /* {
    border: 'none',
    'background-color': '#333333',
    color: '#cc7832'
  }*/

formStyle; /* {
    color: '#437da8',
    'background-color': 'rgba(34, 34, 34, 0.75)',
    'backdrop-filter': 'blur(50px)',
    'box-shadow': '0 2px 10px rgba(0, 0, 0, 0.075)'
  }*/

textStyle; //{ color: '#cc7832' };
```

## Development

### Serve

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

### Build

Run `ng build contact-form` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build (e.g. when building to publish to npm).

### Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io).

## To Do

Apply Material Design
Extract CSS variables

## Contributing

Contributions are welcome, although the library is still in an alpha stage. Feel free to open a PR and I'll have a look!
