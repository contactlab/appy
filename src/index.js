// @flow

import type {RequestFn} from './request';
import type {WrapApiFn} from './api';

import request from './request';
import api from './api';

interface Appy {
  request: RequestFn,
  api: WrapApiFn
}

const appy: Appy = {
  request,
  api
};

export default appy;