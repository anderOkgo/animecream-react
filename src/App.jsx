import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import Jumbotron from './components/Jumbotron/Jumbotron';
import { useAlive } from './hooks/useAlive';
import { useTheme } from './hooks/useTheme';
import { LanguageProvider } from './contexts/LanguageContext';

const App = () => {
  const { init, proc, boot } = useAlive();
  const { toggleDarkMode } = useTheme();

  return (
    <LanguageProvider>
      <div className="app">
        <Menu {...{ init, proc, boot, toggleDarkMode }} />
        <div className="card-area">
          <Jumbotron />
          <Home />
        </div>
      </div>
    </LanguageProvider>
  );
};

export default App;
