import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import Jumbotron from './components/Jumbotron/Jumbotron';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import { useLanguage } from './hooks/useLanguage';

const App = () => {
  const { init, proc, boot } = useAlive();
  const { toggleDarkMode } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <div className="app">
      <Menu {...{ init, proc, boot, toggleDarkMode }} />
      <div className="card-area">
        <Jumbotron {...{ t }} />
        <Home {...{ t, toggleLanguage, language }} />
      </div>
    </div>
  );
};

export default App;
