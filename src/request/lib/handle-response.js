// @flow

type Payload = {
  message?: string
}

export type NormResponse = {
  status: number,
  payload: Payload
}

const toPayload = (t: string): Payload => {
  try {
    return JSON.parse(t);
  } catch (e) {
    return {
      message: t
    }
  }
};

const normalize = ({ok, status}: Response) => (payload: Payload): Promise<NormResponse> =>
  ok
    ? Promise.resolve({ status, payload })
    : Promise.reject({ status, payload });

export default (r: Response): Promise<NormResponse> =>
  r.text()
    .then(toPayload)
    .then(normalize(r));