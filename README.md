# Centig

[![NPM version](https://img.shields.io/npm/v/centig.svg)](https://www.npmjs.org/package/centig)
[![size](https://bundlephobia.com/result?p=centig@1.0.11)](https://bundlephobia.com/result?p=centig@1.0.11)
[![Build Status](https://travis-ci.org/Alexloof/centig.svg?branch=master)](https://travis-ci.org/Alexloof/centig)
[![codecov](https://codecov.io/gh/Alexloof/centig/branch/master/graph/badge.svg)](https://codecov.io/gh/Alexloof/centig)

> The Configuration Management library for your JavaScript application

## Introduction

The goal with Centig is to give the developer the opportunity to include all configuration in one single file with a logical hierarchical structure. The Centig configuration schema API aims to be very distinct with a simple overview of the context and the origin of each config value. Therefore, Centig does not believe in overriding and extending configurations. Each value can be configured very differently, depending on how important or dynamic the value can be. Centig has a validation-first approach (by default) where it should **NOT** be possible to launch the application without having all the values ​​present that were defined in the schema.

## Install

```shell
npm install centig
```

## Usage

Here is an example of a config file with some static and some configs coming from environment variables.

```javascript
const { centig } = require('centig');

const config = centig({
  db: {
    host: 'localhost',
    port: 5050,
    name: 'admin',
  },
  api: {
    url: {
      type: String,
      env: 'API_URL',
      validate: value => new URL(value),
    },
    key: {
      type: Number,
      env: 'API_KEY',
      preprocess: value => Number(value),
    },
  },
  newFeature: {
    isSupported: {
      type: Boolean,
      env: 'NEW_FEATURE_SUPPORT',
      preprocess: value => Boolean(Number(value)),
    },
    regex: {
      type: RegExp,
      value: /\babc\b/,
    },
  },
  logLevel: {
    type: String,
    env: 'LOG_LEVEL',
    validate: value => {
      const logLevels = ['debug', 'trace', 'info', 'warn', 'error', 'fatal'];
      if (!logLevels.includes(value)) {
        throw Error(
          `The value - ${value} for logLevel must be one of ${logLevels}`,
        );
      }
    },
  },
});

module.exports = config;
```

Then we can in any other file import and use the config module as seen below.

```javascript
const config = require('./config');

const apiUrl = config.get('api').url;
console.log(`This is the api url: ${apiUrl}`);

const isNewFeatureSupported = config.get('newFeature.isSupported');
console.log(`This is the newFeature isSupported: ${isNewFeatureSupported}`);
```

## API

### const config = centig(schema)

The configuration schema passed into the Centig module can be configured very differently depending on the needs. Eather we use the shortcut alternative or we pass a Centig specific configuration object. The following properties can be used:

| Properties | Type                  | Required        | Description                                                                                                             |
| ---------- | --------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| type       | constructor           | ✘               | Simple type validation. Supported are: String, Number, Boolean, Array, Object, RegExp.                                  |
| env        | string                | ✓ (if no value) | This value is grabbed from **process.env**.                                                                             |
| value      | any                   | ✓ (if no env)   | If the config value is not from process.env we can use this property. But maybe the shortcut alternative fits better.   |
| preprocess | (value: any) => value | ✘               | A custom function if we wanna process the value. Useful if we wanna perform any conversion before the validation.       |
| validate   | (value: any) => void  | ✘               | A custom function if we wanna perform extra validation. Remember to throw Error if the value is not validating.         |
| optional   | boolean               | ✘               | Defaults to false. We can flip this to true if we don't wanna require a value to be present. No validation will be made |

Example:

```javascript
const { centig } = require('centig');

const config = centig({
  api: {
    url: {
      type: String,
      env: 'API_URL', // Trying to grab process.env.API_URL
      validate: value => new URL(value),
    },
    key: {
      type: Number,
      env: 'API_KEY', // Trying to grab process.env.API_KEY
      preprocess: value => Number(value),
    },
  },
});
```

To use the shortcut method we simply define key-value pairs, where the value could be whatever we want, such as a number or a string. This may be a good choice if no validation or processing is needed. See the example below.

```javascript
const { centig } = require('centig');

const config = centig({
  db: {
    host: 'localhost',
    port: 5050,
    name: 'admin',
  },
  api: {
    url: 'https://api.url.com',
    key: 'api-key',
  },
});
```

### config.get(key)

Returns the value by key name.

```javascript
config.get('api').url;
// or
config.get('api.url');
```

### config.all()

Returns all configurations

## Typescript

Centig comes with types and to take advantage of this we can define an interface for our schema and pass it when we call `centig<Interface>(schema)`.

```typescript
import centig from 'centig';

interface Schema {
  db: {
    host: string;
    port: number;
    name: string;
  };
  api: {
    url: string;
    key: number;
  };
}

const config = centig<Schema>({
  db: {
    host: 'localhost',
    port: 5050,
    name: 'admin',
  },
  api: {
    url: {
      type: String,
      env: 'API_URL', // Trying to grab process.env.API_URL
      validate: value => new URL(value),
    },
    key: {
      type: Number,
      env: 'API_KEY', // Trying to grab process.env.API_KEY
      preprocess: value => Number(value),
    },
  },
});

config.get('api').url; // is now fully typed
```

Calling .get() with a dotted path is not yet supported.

## Inspiration

- [mozilla/node-convict](https://github.com/mozilla/node-convict) Featureful configuration management library for Node.js.
- [lorenwest/node-config](https://github.com/lorenwest/node-config) Node.js Application Configuration.
