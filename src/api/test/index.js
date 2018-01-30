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
  t.is(typeof api, 'function', 'Api config should be a function');
  t.is(typeof api(), 'function', 'Api request should be a function');
});

test('api - no config', t => {
  api()('GET')
    .catch(e => 
      t.is(e, 'Config error')
    );

  t.false(t.context.spy.called);
});

test('GET - no token', t => {
  api({ baseUri })('GET')
    .catch(e => 
      t.is(e, 'Config error')
    );

  t.false(t.context.spy.called);
});

test('GET', t => {
  api({ baseUri, token })('GET', ENDPOINT)
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

test('GET - no `baseUri`', t => {
  api({ token })('GET', ENDPOINT)
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

test('POST - with id & init headers', t => {
  api({ baseUri, token, id: 'pippo' })('POST', ENDPOINT, {
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

test('DELETE - with id & version', t => {
  api({ baseUri, token, id: 'pippo', version: '1.0.0' })('DELETE', ENDPOINT, {})
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

test('PUT - with body', t => {
  api({ baseUri, token })('PUT', ENDPOINT, {
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