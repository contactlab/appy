import test from 'ava';
import sinon from 'sinon';
import api from '../index';

const ENDPOINT = '/me';
const baseUri = 'http://localhost:3000';
const URI = `${baseUri}${ENDPOINT}`;
const token = 'myToken';

const handleError = t => e => {
  t.is(e.name, 'FetchError');
}

test.beforeEach('provide spy on "fetch"', t => {
  t.context.spy = sinon.spy(global, 'fetch');
});

test.afterEach('provide spy on "fetch"', t => {
  t.context.spy.restore();
});

test('interface', t => {
  const myFetch = api();
  t.is(typeof myFetch.get, 'function', 'Should should have a "get" method');
  t.is(typeof myFetch.post, 'function', 'Should should have a "post" method');
  t.is(typeof myFetch.put, 'function', 'Should should have a "put" method');
  t.is(typeof myFetch.delete, 'function', 'Should should have a "delete" method');
});

test('.get() without token', t => {
  const myFetch = api({ baseUri });
  myFetch.get(ENDPOINT)
    .catch(err => {
      t.deepEqual(err, {
        payload: {
          message: 'Token is required'
        }
      })
    });

  t.false(t.context.spy.called);
});

test('.get()', t => {
  const myFetch = api({ baseUri, token });
  const p = myFetch.get(ENDPOINT)
    .catch(handleError(t));

  t.true(t.context.spy.calledWith(URI, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json',
      'Authorization': 'Bearer myToken'
    }
  }));
});

test('.post() with id & init headers', t => {
  const myFetch = api({ baseUri, token, id: 'pippo' });
  myFetch.post(ENDPOINT, {
    headers: {
      'X-Custom': 'Header'
    }
  })
    .catch(handleError(t));

  t.true(t.context.spy.calledWith(URI, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json',
      'Authorization': 'Bearer myToken',
      'Contactlab-ClientId': 'pippo',
      'X-Custom': 'Header'
    }
  }));
});

test('.delete() with id & version', t => {
  const myFetch = api({ baseUri, token, id: 'pippo', version: '1.0.0' });
  myFetch.delete(ENDPOINT, {})
    .catch(handleError(t));

  t.true(t.context.spy.calledWith(URI, {
    method: 'DELETE',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json',
      'Authorization': 'Bearer myToken',
      'Contactlab-ClientId': 'pippo',
      'Contactlab-ClientVersion': '1.0.0'
    }
  }));
});

test('.put() with body', t => {
  const myFetch = api({ baseUri, token });
  myFetch.put(ENDPOINT, {
    body: { a: 1 }
  })
    .catch(handleError(t));

  t.true(t.context.spy.calledWith(URI, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json',
      'Authorization': 'Bearer myToken'
    },
    body: '{"a":1}'
  }));
});