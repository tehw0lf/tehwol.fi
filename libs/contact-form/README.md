# contact-form

This provides a simple way to let your users contact you.
The component takes as input an API-URL.

Default is 'https://forwardmethis.com/tehwolf@pm.me' - please change it, as you will need to confirm the API access for the first email you will receive.

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
```

### Module

If it's not added already, please run `ng add @angular/material` prior to adding this module.
Run `ng add @tehw0lf/contact-form` in the workspace root of your angular application.

## Usage

The contact form component takes an apiURL and an email as input. By default, this is set to [ForwardMeThis](https://forwardmethis.com) and the email address is blank. You can set the variables on the component tag:

```html
<contact-form
  [apiURL]="emailBackendURL"
  [email]="yourEmailAddress"
></contact-form>
```

In your component, set the `emailBackendURL` and `yourEmailAddress` properties. The naming of these variables is arbitrary:

```ts
emailBackendURL; //'https://forwardmethis.com/';
yourEmailAddress; //'my@mail.com'; //this is optional, if your API URL doesn't require an email address parameter
```

This contact form will send a POST request to the API, containing the following data structure:

```json
{
  "name": "your entered name",
  "email": "your entered email address",
  "message": "your entered message"
}
```

You can of course use your own backend with this data structure, as the API-URL and E-Mail address can be overridden as shown above.

## Theming

The styles of form background, button, input and text can be customized with optional input parameters:

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

inputStyle; /* {
    border: 'none',
    color: '#282b2e',
    'background-color': '#fff'
  }*/

textStyle; //{ color: '#cc7832' };
```

## Text

You can specify your own texts for the fields and labels, or leave the default English version

```ts
nameLabel; //'Your Name';

emailAddressLabel; //'Your E-Mail Address';

messageLabel; //'Your Message';

sendText; //'Send';

sendSuccessfulText; //'E-Mail successfully sent';

sendErrorText; //'Send error';
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
