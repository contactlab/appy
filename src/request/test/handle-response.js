import test from 'ava';
import handleResponse from '../handle-response';
import { response } from './_helpers';

test('handleResponse() - 200', t => {
  const actualR = handleResponse(response('{ "a": 1 }', true));

  t.is(typeof actualR.then, 'function', 'should be a Promise');
  return actualR.then(res => {
    t.deepEqual(res, {
      status: 200,
      payload: { a: 1 }
    }, 'should resolve with success payload');
  });
});

test('handleResponse() - 200 with string', t => {
  const actualR = handleResponse(response('Just a string', true));

  t.is(typeof actualR.then, 'function', 'should be a Promise');
  return actualR.then(res => {
    t.deepEqual(res, {
      status: 200,
      payload: {
        message: 'Just a string'
      }
    }, 'should resolve with success payload');
  });
});

test('handleResponse() - 404', t => {
  const actualR = handleResponse(response('Not found', false, 404));

  t.is(typeof actualR.catch, 'function', 'should be a Promise');
  return actualR
    .catch(e => {
      t.deepEqual(e, {
        status: 404,
        payload: {
          message: 'Not found'
        }
      }, 'should reject with error 404 payload');
    });
});

test('handleResponse() - 500', t => {
  const actualR = handleResponse(response('{"error": "Internal server error"}', false));

  t.is(typeof actualR.then, 'function', 'should be a Promise');
  return actualR
    .then(null, e => {
      t.deepEqual(e, {
        status: 500,
        payload: {
          error: 'Internal server error'
        }
      }, 'should reject with error 500 payload');
    });
});
