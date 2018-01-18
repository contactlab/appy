import test from 'ava';
import sinon from 'sinon';
import api from '../index';

const ENDPOINT = '/me';
const baseUri = 'http://localhost:3000';
const URI = `${baseUri}${ENDPOINT}`;
const token = 'myToken';

const handleError = t => e => 
  t.is(e.name, 'FetchError');


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

test('api() without config', t => {
  api()
    .get(ENDPOINT)
    .catch(e => 
      t.is(e, 'Config error')
    );

  t.false(t.context.spy.called);
});

test('.get() without token', t => {
  api({ baseUri })
    .get(ENDPOINT)
    .catch(e => 
      t.is(e, 'Config error')
    );

  t.false(t.context.spy.called);
});

test('.get()', t => {
  api({ baseUri, token })
    .get(ENDPOINT)
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

test('.get() - no `baseUri`', t => {
  api({ token })
    .get(ENDPOINT)
    .catch(handleError(t));

  t.true(t.context.spy.calledWith(ENDPOINT, {
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
  api({ baseUri, token, id: 'pippo' })
    .post(ENDPOINT, {
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
  api({ baseUri, token, id: 'pippo', version: '1.0.0' })
    .delete(ENDPOINT, {})
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
  api({ baseUri, token })
    .put(ENDPOINT, {
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