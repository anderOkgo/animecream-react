import set from '../helpers/set.json';

const normalizeHttpErrorMessage = (responseBody) => {
  if (responseBody == null) {
    return 'Unknown error';
  }
  if (typeof responseBody === 'string') {
    return responseBody;
  }
  if (Array.isArray(responseBody)) {
    return responseBody;
  }
  if (typeof responseBody.message === 'string') {
    return responseBody.message;
  }
  if (typeof responseBody.error === 'string') {
    return responseBody.error;
  }
  if (Array.isArray(responseBody.errors)) {
    return responseBody.errors;
  }
  if (typeof responseBody.message === 'object' && responseBody.message !== null) {
    return normalizeHttpErrorMessage(responseBody.message);
  }
  if (typeof responseBody === 'object') {
    const fieldErrors = Object.values(responseBody).filter((v) => typeof v === 'string');
    if (fieldErrors.length > 0) {
      return fieldErrors;
    }
  }
  return 'Unknown error';
};

const customFetch = async (endpoint, options = {}) => {
  const isFormData = options.body instanceof FormData;
  const defaultHeaders = isFormData
    ? { Authorization: options.token }
    : { Authorization: options.token, 'Content-Type': 'application/json', Accept: 'application/json' };

  const controller = new AbortController();
  const timeout = options.timeout || set.defaul_fetch_request;

  options.signal = controller.signal;
  options.method = options.method || 'GET';
  options.headers = { ...defaultHeaders, ...options.headers };

  if (!isFormData) {
    options.body = JSON.stringify(options.body) || false;
    if (!options.body) delete options.body;
  }

  setTimeout(() => controller.abort(), timeout);

  if (navigator.onLine) {
    try {
      const res = await fetch(endpoint, options);
      const responseBody = await res.json();
      return await (res.ok
        ? responseBody
        : Promise.reject({
            status: res.status || '00',
            statusText: res.statusText || 'An error has occurred',
            message: normalizeHttpErrorMessage(responseBody),
          }));
    } catch (err) {
      console.log({ err });
      const normalizedErr = err.name === 'AbortError' ? { ...err, message: 'Request timeout' } : err;
      return { err: normalizedErr };
    }
  } else {
    return {
      err: { status: '00', statusText: 'Offline', message: 'Offline' },
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
