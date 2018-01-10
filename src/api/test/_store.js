import { createStore } from 'redux';

const INIT = {
  token: null
};

const reducer = (state = INIT, action) => {
  switch (action.type) {
    case 'SET_OAUTH_TOKEN':
      return {
        ...state,
        token: action.payload
      }
    case 'OAUTH_CLEAR':
      return {
        ...state,
        token: null
      }
    default:
      return state;
  }
}

export default createStore(reducer);