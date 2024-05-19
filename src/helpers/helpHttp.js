import set from '../helpers/set.json';

const customFetch = async (endpoint, options = {}) => {
  const defaultHeaders = {
    Authorization: options.token,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  const controller = new AbortController();
  const timeout = options.timeout || set.defaul_fetch_request;

  options.signal = controller.signal;
  options.method = options.method || 'GET';
  options.headers = { ...defaultHeaders, ...options.headers };

  options.body = JSON.stringify(options.body) || false;
  if (!options.body) delete options.body;

  setTimeout(() => controller.abort(), timeout);

  if (navigator.onLine) {
    try {
      const res = await fetch(endpoint, options);
      return await (res.ok
        ? res.json()
        : Promise.reject({
            err: true,
            status: res.status || '00',
            statusText: res.statusText || 'An error has occurred',
            response: await res.json(),
          }));
    } catch (err) {
      console.log({ err });
      return { err };
    }
  } else {
    return {
      err: true,
      status: '00',
      statusText: 'Offline',
    };
  }
};

const get = (url, options = {}) => customFetch(url, options);

const opt = (url, options = {}) => {
  options.method = 'OPTIONS';
  return customFetch(url, options);
};

const post = (url, options = {}) => {
  options.method = 'POST';
  return customFetch(url, options);
};

const put = (url, options = {}) => {
  options.method = 'PUT';
  return customFetch(url, options);
};

const del = (url, options = {}) => {
  options.method = 'DELETE';
  return customFetch(url, options);
};

const helpHttp = { get, post, put, del, opt };

export default helpHttp;
