import helpHttp from '../helpers/helpHttp';
//const API_URL = 'http://localhost:3001/api/users/';
const API_URL = 'https://info.animecream.com/api/users/';

const register = (username, email, password) => {
  return helpHttp.post(API_URL, {
    username,
    email,
    password,
  });
};

const login = async (username, password) => {
  const loginPayload = {
    first_name: username,
    password,
  };

  let options = {
    body: loginPayload,
  };

  const response = await helpHttp.post(API_URL + 'login', options);
  if (response.token === undefined) {
    return false;
  } else {
    localStorage.setItem('user', JSON.stringify(response));
    return true;
  }
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
  register,
  login,
  logout,
  getCurrentUser,
};

export default AuthService;

/* export function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToken) {
    return { Authorization: 'Bearer ' + user.accessToken };
  } else {
    return {};
  }
} */
