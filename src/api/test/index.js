import test from 'ava';
import sinon from 'sinon';
import api from '../index';
import { fakeToken, fakeTokenClear } from './_helpers';

const ENDPOINT = '/me';
const baseUri = 'http://localhost:3000';
const URI = `${baseUri}${ENDPOINT}`;

test.beforeEach('provide spy on "fetch"', t => {
  t.context.spy = sinon.spy(global, 'fetch');
});

test.afterEach('provide spy on "fetch"', t => {
  t.context.spy.restore();
  fakeTokenClear();
});

test('methods exist', t => {
  const myFetch = api({ baseUri });
  t.is(typeof myFetch.get, 'function', 'Should should have a "get" method');
  t.is(typeof myFetch.post, 'function', 'Should should have a "post" method');
  t.is(typeof myFetch.put, 'function', 'Should should have a "put" method');
  t.is(typeof myFetch.delete, 'function', 'Should should have a "delete" method');
});

test('.get()', t => {
  const myFetch = api({ baseUri });
  myFetch.get(ENDPOINT);
  t.true(t.context.spy.calledWith(URI, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      'Content-type': 'application/json'
    }
  }));
});