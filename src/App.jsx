import './App.css';
import CardInfo from './components/CardInfo/CardInfo';
import Menu from './components/Menu/Menu';
import Jumbotron from './components/Jumbotron/Jumbotron';

const App = () => {
  return (
    <div className="app">
      <Menu />
      <Jumbotron title="AnimeCream APP" description="The best recommendation about anime" />
      <CardInfo />
    </div>
  );
};

export default App;
