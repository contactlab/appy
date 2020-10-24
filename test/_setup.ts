import 'abort-controller/polyfill';
import {Headers, Request, Response} from 'cross-fetch';
import fetchMock from 'fetch-mock';

(global as any).fetch = fetchMock.sandbox();
(global as any).Headers = Headers;
(global as any).Request = Request;
(global as any).Response = Response;
