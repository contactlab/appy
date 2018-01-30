import test from 'ava';
import sinon from 'sinon';
import myFetch from '../index';

const URI = 'http://me';

const handleError = t => e => {
  t.is(e.name, 'FetchError');
};

test.beforeEach('provide spy on "fetch"', t => {
  t.context.spy = sinon.spy(global, 'fetch');
});

test.afterEach('restore spy on "fetch"', t => {
  t.context.spy.restore();
});

test('function exists', t => {
  t.is(typeof myFetch, 'function', 'Should be a function');
});

test('GET', t => {
  myFetch('GET', URI).catch(handleError(t));
  t.true(t.context.spy.calledWith(URI, {
    method: 'GET',
    mode: 'cors'
  }));
});

test('GET with some header', t => {
  myFetch('GET', URI, {
    headers: {
      'Custom-Header': 'custom-header'
    }
  }).catch(handleError(t));
  t.true(t.context.spy.calledWith(URI, {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Custom-Header': 'custom-header'
    }
  }));
});

test('POST with token', t => {
  myFetch('POST', URI, {
    headers: {
      'Authorization': 'Bearer myToken'
    }
  }).catch(handleError(t));
  t.true(t.context.spy.calledWith(URI, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Authorization': 'Bearer myToken'
    }
  }));
});

test('PUT with body', t => {
  myFetch('PUT', URI, {
    headers: {
      'Authorization': 'Bearer myToken'
    },
    body: {
      a: 1
    }
  }).catch(handleError(t));
  t.true(t.context.spy.calledWith(URI, {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Authorization': 'Bearer myToken'
    },
    body: '{"a":1}'
  }));
});

test('DELETE', t => {
  myFetch('DELETE', URI).catch(handleError(t));
  t.true(t.context.spy.calledWith(URI, {
    method: 'DELETE',
    mode: 'cors'
  }));
});