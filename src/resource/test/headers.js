import test from 'ava';
import headers from '../lib/headers';

test('Default headers', t => {
  t.deepEqual(headers(), {
    'Accept': 'application/json',
    'Content-type': 'application/json'
  });
  t.deepEqual(headers(null), {
    'Accept': 'application/json',
    'Content-type': 'application/json'
  })
});

test('id header', t => {
  const id = 'id_prova';
  t.deepEqual(headers({
    id
  }), {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    'Contactlab-ClientId': id
  });
});

test('version header', t => {
  const version = '1.0.0';
  t.deepEqual(headers({
    version
  }), {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    'Contactlab-ClientVersion': version
  });
});

test('token header', t => {
  const token = 'myToken';
  t.deepEqual(headers({
    token
  }), {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    'Authorization': `Bearer ${token}`
  });
});

test('extra headers', t => {
  const extra = {
    'custom1': 'pippo',
    'custom2': 'pluto'
  };
  t.deepEqual(headers({
    extra
  }), {
    'Accept': 'application/json',
    'Content-type': 'application/json',
    ...extra
  });
});