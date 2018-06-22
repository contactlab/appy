import {ApiConfig, ApiOptionsNoContent} from '../src/api';
import {optsToRequestInit} from '../src/opts-to-request-init';

const CONFIG1: ApiConfig = {baseUri: 'https://...'};
const CONFIG2: ApiConfig = {...CONFIG1, id: 'App'};
const CONFIG3: ApiConfig = {...CONFIG2, version: '1.2.3'};
const OPTS1: ApiOptionsNoContent = {
  token: 'abc',
  headers: {'Custom-Header': 'custom'},
  body: '{"data":"abc"}'
};
const OPTS2: ApiOptionsNoContent = {
  token: 'abc',
  headers: {Accept: 'text/html', 'Content-type': 'text/html'},
  mode: 'same-origin'
};

test('should return a RequestInit object with data from ApiOptionsNoContent - use defaults', () => {
  expect(optsToRequestInit(CONFIG1, OPTS1)).toEqual({
    token: 'abc',
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
    token: 'abc',
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
    token: 'abc',
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

test('should return a RequestInit object with data from ApiOptionsNoContent - ovveride defaults', () => {
  expect(optsToRequestInit(CONFIG1, OPTS2)).toEqual({
    token: 'abc',
    headers: {
      Authorization: 'Bearer abc',
      Accept: 'text/html',
      'Content-type': 'text/html'
    },
    mode: 'same-origin'
  });
});
