export const response = (data, success, status) => ({
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(data),
  ok: success,
  status: status || (success ? 200 : 500)
});

export const fakeFetch = () => ({
  then: f => f(response({}, true))
});