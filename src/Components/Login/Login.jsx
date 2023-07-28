import { useState, useRef } from 'react';
import AuthService from '../../services/auth.service';
import './Login.css';

const Login = () => {
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
    let resp = await AuthService.login(username, password);
    //alert(resp);

    if (resp) {
      window.location.reload();
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img
          src="https://yt3.googleusercontent.com/ytc/AOPolaREZCtxoq-_qTVDtexVZc85xutRQ4MNpn-YFgos8Q=s176-c-k-c0x00ffffff-no-rj"
          alt="profile-img"
          className="profile-img-card"
        />
        <form onSubmit={handleLogin} ref={form}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={onChangeUsername}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChangePassword}
            />
          </div>

          <div className="form-group">
            <button className="btn btn-primary btn-block">
              <span>Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
