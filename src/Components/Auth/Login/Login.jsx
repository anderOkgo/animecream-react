import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../../../services/auth.service';
import './Login.css';

const Login = ({ t, init, setInit, setProc, onLoginSuccess }) => {
  const form = useRef();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (init) {
      setProc(true);
      let resp = await AuthService.login(username, password);
      if (resp?.err) {
        if (Array.isArray(resp?.err?.message)) {
          resp.err.message.map((err) => alert(t(err)));
        } else {
          alert(t(resp?.err?.message || 'Unknown error'));
        }
        setInit(false);
      } else {
        setInit(Date.now());
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
      setProc(false);
    } else {
      alert(t('Offline'));
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img src="./img/icon/android-icon-512x512.png" alt="profile-img" className="profile-img-card" />
        <form onSubmit={handleLogin} ref={form}>
          <div className="form-group">
            <label className="label" htmlFor="username">
              {t('username')}
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={onChangeUsername}
              maxLength={20}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChangePassword}
              maxLength={20}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <button className="btn-primary btn-block">
              <span>{t('login')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  t: PropTypes.func.isRequired,
};

export default Login;
