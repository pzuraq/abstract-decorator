# abstract-decorator

JavaScript doesn't have a built in language feature for defining abstract
classes and enforcing their contracts - but with decorators, we can create that
functionality ourselves! The `@abstract` decorator allows you to define simple
abstract classes, like so:

```js
@abstract
class CookieService {
  @abstract headers;

  @abstract getValue() {}
  @abstract setValue() {}
}
```

You can then extend the class and provide the abstract values:

```js
class BrowserCookieService extends CookieService {
  headers = new Map();

  getValue() {
    // get cookie value
  }

  setValue(value) {
    // set cookie value
  }
}
```

If a subclass fails to provide the correct values, then an error will be thrown
the first time the class is instatiated. The two types of abstract values that
can be defined are _fields_ and _methods_, and they are defined by decorating a
class field or a method respectively.

### Dev Time Only

The errors thrown by `@abstract` are useful in development, but are pointless
overhead in production applications. If you're consuming this package, you can
remove the decorators using the [filter-imports](https://github.com/ember-cli/babel-plugin-filter-imports)
babel plugin:

```json
{
  "plugins": [
    [
      "babel-plugin-filter-imports",
      {
        "imports": {
          "abstract-decorator": ["default"]
        }
      }
    ]
  ]
}
```

This setup is provided out-of-the-box in Ember apps and addons, zero
configuration necessary!

## Compatibility

This package is compatible with Node v10 and above out of the box.

### Ember

- Ember.js v2.18 or above
- Ember CLI v2.13 or above
- Node.js v8 or above

## Installation

```sh
npm install --save abstract-decorator

# or with yarn
yarn add abstract-decorator
```

## Contributing

See the [Contributing](CONTRIBUTING.md) guide for details.

## License

This project is licensed under the [MIT License](LICENSE.md).
