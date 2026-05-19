import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../../../services/auth.service';
import './Login.css';

const Login = ({ t, init, setInit, onLoginSuccess }) => {
  const form = useRef();
  const isSubmitting = useRef(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    if (!init) {
      alert(t('Offline'));
      return;
    }
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsLoading(true);
    try {
      let resp = await AuthService.login(username, password);
      if (resp?.err) {
        if (Array.isArray(resp?.err?.message)) {
          resp.err.message.map((err) => alert(t(err)));
        } else {
          alert(t(resp?.err?.message || 'errorUnknown'));
        }
        // No llamar setInit(false) — password incorrecto ≠ servidor offline
      } else {
        setInit(Date.now());
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      }
    } catch (error) {
      alert(t('errorUnknown'));
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
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
              onInvalid={(e) => e.target.setCustomValidity(t('pleaseFillThisField'))}
              onInput={(e) => e.target.setCustomValidity('')}
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
              onInvalid={(e) => e.target.setCustomValidity(t('pleaseFillThisField'))}
              onInput={(e) => e.target.setCustomValidity('')}
              maxLength={20}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <button className="btn-primary btn-block" disabled={isLoading}>
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
