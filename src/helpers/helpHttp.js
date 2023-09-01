const customFetch = async (endpoint, options) => {
  var myHeaders = new Headers();
  myHeaders.append('Authorization', options.token);
  myHeaders.append('Content-Type', 'application/json');

  const controller = new AbortController();
  options.signal = controller.signal;

  options.method = options.method || 'GET';
  options.headers = options.headers ? { ...myHeaders, ...options.headers } : myHeaders;

  options.body = JSON.stringify(options.body) || false;
  if (!options.body) delete options.body;

  setTimeout(() => controller.abort(), 7000);
  //console.log(options);

  try {
    const res = await fetch(endpoint, options);
    return await (res.ok
      ? res.json()
      : Promise.reject({
          err: true,
          status: res.status || '00',
          statusText: res.statusText || 'Ocurrió un error',
        }));
  } catch (err) {
    return err;
  }
};

const get = (url, options = {}) => customFetch(url, options);

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

const helpHttp = { get, post, put, del };

export default helpHttp;
