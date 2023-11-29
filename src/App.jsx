import './App.css';
import CardInfo from './components/CardInfo/CardInfo';
import Menu from './components/Menu/Menu';
import Jumbotron from './components/Jumbotron/Jumbotron';
import { useAlive } from '../src/hooks/useAlive';

const App = () => {
  const { init, setInit, proc, setProc } = useAlive();

  return (
    <div className="app">
      <Menu {...{ init, proc }} />
      <Jumbotron title="AnimeCream APP" description="The best recommendations about anime" />
      <CardInfo />
    </div>
  );
};

export default App;
