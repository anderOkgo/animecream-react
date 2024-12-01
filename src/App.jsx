import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import Jumbotron from './components/Jumbotron/Jumbotron';
import { useAlive } from '../src/hooks/useAlive';
import { useTheme } from '../src/hooks/useTheme';

const App = () => {
  const { init, setInit, proc, setProc, boot } = useAlive();
  const { toggleDarkMode } = useTheme();

  return (
    <div className="app">
      <Menu {...{ init, proc, boot, toggleDarkMode }} />
      <Jumbotron title="AnimeCream APP" description="The best recommendations about anime" />
      <Home />
    </div>
  );
};

export default App;
