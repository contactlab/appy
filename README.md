# Appy [![Build Status](https://travis-ci.org/contactlab/appy.svg?branch=master)](https://travis-ci.org/contactlab/appy)

Fetch API the Contactlab way

This package is statically typed using Flow

## Install

```sh
  $ yarn add @contactlab/appy
```

## Use

### Request

```js
  import {request} from '@contactlab/appy';

  const options = {
    // request options
  };

  // request :: (String, String, ?Object) => Promise<Object>
  request('GET', 'https://my.api.com/me', options)
    .then(handleResponse)
    .catch(handleError)
```

Request `options`:
  - There is no need to specify a `method` key, it is overridden by the method argument passed to `request()`.
  - The default `mode` is set to "cors".
  - The `body` content gets stringified, so objects are accepted

`request` returns a Promise.
For both Success and Reject cases the return type is:

```js
Promise<{
  status: string,
  payload: Object
}>
```

### Api

Internally uses the `request()`.

```js
  import {api} from '@contactlab/appy';

  const config = {
    baseUri: 'https://my.api.com',
    id: 'module_id',
    version: '1.0.0'
  }
  const options = {
    // request options
  };

  // api :: (Object) => (String, String, String, ?Object) => Promise<Object>
  const myFetch = api(config);
  myFetch('GET', '/me', 'myToken', options)
    .then(handleResponse)
    .catch(handleError)
```

Request `options` as above apart from the headers:
  - If not overwritten by the headers passed in, `"Accept"` and `"Content-type"` are set to "application/json".
  - `"Authorization"` is set by the `token` argument.
  - `"Contactlab-ClientId"` is set by the `id` key of the configuration.
  - `"Contactlab-ClientVersion"` is set by the `version` key of the configuration.

`api` at the second call returns the `request` Promise type. 

Unless a configuration error occurs, in that case the return type will be:

```js
Promise<{
  error: string
}>
```

### Test

```sh
  $ yarn test
```