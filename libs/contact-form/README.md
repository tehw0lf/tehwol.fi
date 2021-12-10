# contact-form

This provides a simple way to let your users contact you.
The component takes as input an API-URL.

Default is 'https://forwardmethis.com/tehwolf@pm.me' - please change it, as you will need to confirm the API access for the first email you will receive.

```html
<contact-form [apiURL]="emailBackendURL"></contact-form>
```

In your component, set the `emailBackendURL` property. The naming of this variable is arbitrary:

```ts
emailBackendURL = 'https://forwardmethis.com/my@email.com';
```

This contact form will send a POST request to the API, containing the following data structure:

```json
{
  "name": "your entered name",
  "email": "your entered email address",
  "message": "your entered message"
}
```

You can of course use your own backend with this data structure, as the API-URL can be overridden as shown above.
