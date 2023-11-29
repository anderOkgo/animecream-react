import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import AuthService from './auth.service';

const BASE_URL = set.baseUrl;
const API_URL = BASE_URL + 'api/finan/';

const balanceMonthly = async () => {
  return await helpHttp.get(API_URL + 'totalbank', {});
};

const formatToken = (token) => 'Bearer ' + token;

const totalBank = async (data) => {
  return await helpHttp.post(API_URL + 'totalbank', {
    body: data,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};
const boot = async () => {
  return await helpHttp.get(BASE_URL, { timeout: set.boot_timeout });
};

const insert = async (par) => {
  return await helpHttp.post(API_URL + 'insert', {
    body: par,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const update = async (par) => {
  return await helpHttp.put(API_URL + 'update/' + par.id, {
    body: par,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const del = async (par) => {
  return await helpHttp.del(API_URL + 'delete/' + par.id, {
    body: par,
    token: formatToken(AuthService.getCurrentUser().token),
  });
};

const DataService = { totalBank, insert, update, del, boot, balanceMonthly };

export default DataService;
