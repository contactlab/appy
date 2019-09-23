import * as t from 'io-ts';
import {optsToRequestInit} from '../opts-to-request-init';

const CONFIG1 = {baseUri: 'https://...'};
const CONFIG2 = {...CONFIG1, id: 'App'};
const CONFIG3 = {...CONFIG2, version: '1.2.3'};

const OPTS1 = {
  token: 'abc',
  headers: {'Custom-Header': 'custom'},
  body: '{"data":"abc"}',
  decoder: t.undefined
};
const OPTS2 = {
  token: 'abc',
  headers: {Accept: 'text/html', 'Content-type': 'text/html'},
  mode: 'same-origin' as RequestMode,
  decoder: t.undefined
};

test('should return a RequestInit object with data from ApiOptions - use defaults', () => {
  expect(optsToRequestInit(CONFIG1, OPTS1)).toEqual({
    headers: {
      Authorization: 'Bearer abc',
      Accept: 'application/json',
      'Content-type': 'application/json',
      'Custom-Header': 'custom'
    },
    mode: 'cors',
    body: '{"data":"abc"}'
  });

  expect(optsToRequestInit(CONFIG2, OPTS1)).toEqual({
    headers: {
      Authorization: 'Bearer abc',
      Accept: 'application/json',
      'Content-type': 'application/json',
      'Contactlab-ClientId': 'App',
      'Custom-Header': 'custom'
    },
    mode: 'cors',
    body: '{"data":"abc"}'
  });

  expect(optsToRequestInit(CONFIG3, OPTS1)).toEqual({
    headers: {
      Authorization: 'Bearer abc',
      Accept: 'application/json',
      'Content-type': 'application/json',
      'Contactlab-ClientId': 'App',
      'Contactlab-ClientVersion': '1.2.3',
      'Custom-Header': 'custom'
    },
    mode: 'cors',
    body: '{"data":"abc"}'
  });
});

test('should return a RequestInit object with data from ApiOptions - ovveride defaults', () => {
  expect(optsToRequestInit(CONFIG1, OPTS2)).toEqual({
    headers: {
      Authorization: 'Bearer abc',
      Accept: 'text/html',
      'Content-type': 'text/html'
    },
    mode: 'same-origin'
  });
});
