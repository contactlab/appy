import test from 'ava';
import options from '../lib/options';

test('default options', t => {
  t.deepEqual(options()(), {
    method: 'GET',
    mode: 'cors'
  });
  t.deepEqual(options(null)(null), {
    method: 'GET',
    mode: 'cors'
  });
});

test('GET - token & extra headers', t => {
  t.deepEqual(options('GET')({
    headers: {
      'Authorization': 'Bearer myToken',
      'extra-value': '1'
    }
  }), {
    method: 'GET',
    mode: 'cors',
    headers: {
      'Authorization': 'Bearer myToken',
      'extra-value': '1'
    }
  });
});

test('POST - cors & id header', t => {
  t.deepEqual(options('POST')({
    method: 'POST',
    mode: 'opaque',
    headers: {
      'Contactlab-ClientId': 'pluto'
    }
  }), {
    method: 'POST',
    mode: 'opaque',
    headers: {
      'Contactlab-ClientId': 'pluto'
    }
  });
});

test('PUT - body & version header', t => {
  t.deepEqual(options('PUT')({
    method: 'PUT',
    headers: {
      'Contactlab-ClientVersion': '1.0.0'
    },
    body: {
      nome: 'pippo',
      cognome: 'pluto'
    }
  }), {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Contactlab-ClientVersion': '1.0.0'
    },
    body: '{"nome":"pippo","cognome":"pluto"}'
  });
});

test('PUT - incorrect body', t => {
  const john = new Object();
  const mary = new Object();
  john.sister = mary;
  mary.brother = john;

  t.deepEqual(options('PUT')({
    method: 'PUT',
    headers: {
      'Contactlab-ClientVersion': '1.0.0'
    },
    body: john
  }), {
    method: 'PUT',
    mode: 'cors',
    headers: {
      'Contactlab-ClientVersion': '1.0.0'
    },
    body: ''
  });
});