import store from './_store';

export const fakeToken = () => {
  store.dispatch({ type: 'SET_OAUTH_TOKEN' }, payload: 'OAUTH_TOKEN');
};

export const fakeTokenClear = () => {
  store.dispatch({ type: 'OAUTH_CLEAR' });
}