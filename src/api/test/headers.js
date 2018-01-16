import test from 'ava';
import headers from '../lib/headers';

const token = 'myToken';

test('default header', t => {
  t.deepEqual(headers({
    token
  }), {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
});

test('id header', t => {
  const id = 'id_prova';
  t.deepEqual(headers({
    token,
    id
  }), {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'Contactlab-ClientId': id,
        'Authorization': `Bearer ${token}`
      }
    });
});

test('version header', t => {
  const version = '1.0.0';
  t.deepEqual(headers({
    token,
    version
  }), {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'Contactlab-ClientVersion': version,
        'Authorization': `Bearer ${token}`
      }
    });
});

test('extra headers', t => {
  t.deepEqual(headers({
    token
  }, {
      headers: {
        'custom1': 'pippo',
        'custom2': 'pluto'
      }
    }), {
      headers: {
        'Accept': 'application/json',
        'Content-type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'custom1': 'pippo',
        'custom2': 'pluto'
      }
    });
});