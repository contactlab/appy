import * as mockFetch from 'jest-fetch-mock';

declare global {
  namespace NodeJS {
    interface Global {
      fetch: typeof mockFetch;
    }
  }
}

global.fetch = mockFetch;
