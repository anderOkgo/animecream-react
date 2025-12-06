import set from '../helpers/set.json';
import helpHttp from '../helpers/helpHttp';
import cyfer from '../helpers/cyfer';
import { formattedDate } from '../helpers/operations';

const BASE_URL = set.base_url;
const API_URL = BASE_URL + 'api/users/';

const register = async (username, email, password, verificationCode) => {
  const loginPayload = {
    username,
    email,
    password,
    verificationCode,
  };

  let options = {
    body: loginPayload,
  };

  const response = await helpHttp.post(API_URL + 'add', options);
  if (response.message === 'User created successfully') await login(username, password);
  return response.message;
};

const login = async (username, password) => {
  const loginPayload = {
    username: username,
    password,
  };

  let options = {
    body: loginPayload,
  };

  const response = await helpHttp.post(API_URL + 'login', options);
  if (response.token === undefined) {
    return { err: { message: response.err?.message || 'Login failed' } };
  } else {
    localStorage.setItem(cyfer().cy('user-in', formattedDate()), cyfer().cy(JSON.stringify(response), set.salt));
    return { message: response.message };
  }
};

const logout = () => {
  // Solo limpiar datos de autenticación, mantener otros datos como 'storage'
  const storageData = localStorage.getItem('storage');
  const langData = localStorage.getItem('lang');
  localStorage.clear();
  // Restaurar datos que no son de autenticación
  if (storageData) {
    localStorage.setItem('storage', storageData);
  }
  if (langData) {
    localStorage.setItem('lang', langData);
  }
};

const getCurrentUser = () => {
  const storage = localStorage.getItem(cyfer().cy('user-in', formattedDate()));

  if (storage !== null) {
    try {
      return JSON.parse(cyfer().dcy(storage, set.salt));
    } catch (error) {
      console.error('Failed to parse decrypted data:', error);
      return null;
    }
  } else {
    return null;
  }
};

const getUserName = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace(/_/g, '/');
    const decodedPayload = atob(base64);
    const decodedJson = JSON.parse(decodedPayload);
    return { role: decodedJson.role, username: decodedJson.username };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
  getUserName,
};

export default AuthService;
