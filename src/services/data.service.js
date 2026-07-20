import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import { API_BASE_URL } from '../helpers/apiConfig';

const BASE_URL = API_BASE_URL;

const boot = async () => {
  return await helpHttp.get(BASE_URL, { timeout: set.boot_timeout });
};

const DataService = { boot };

export default DataService;
