import './App.css';
import CardInfo from './components/CardInfo/CardInfo';
import Menu from './components/Menu/Menu';
import Jumbotron from './components/Jumbotron/Jumbotron';
import { useAlive } from '../src/hooks/useAlive';
import { useEffect, useState } from 'react';
import AuthService from '../src/services/auth.service';
import Status from '../src/components/Status/Status';

const App = () => {
  const { init, setInit, proc, setProc } = useAlive();
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    user && setCurrentUser(user);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  const title = '';
  const menuItems = [
    { label: 'Cyfer', url: 'https://cyfer.animecream.com/' },
    { label: 'Finanz', url: 'https://finan.animecream.com/' },
    { label: 'Animecream', url: 'https://www.animecream.com/' },
    { label: 'Nabu', url: 'https://nabu.animecream.com/' },
    /*  {
      label: 'session',
      url: '#',
      child: [
        { isSessionNeeded: false, label: 'login', url: '/' },
        { isSessionNeeded: true, label: 'logout', url: '/', trigger: handleLogout },
      ],
    }, */
  ];
  return (
    <div className="app">
      <Menu {...{ init, proc, menuItems, title, currentUser, Status }} />
      <Jumbotron title="AnimeCream APP" description="The best recommendations about anime" />
      <CardInfo />
    </div>
  );
};

export default App;
