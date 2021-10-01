import "./App.css";
import Sidebar from "./components/Sidebar";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Overview from "./pages/Overview";
import { Reports, ReportsOne, ReportsTwo, ReportsThree } from "./pages/Reports";
import Team from "./pages/Team";

function App() {
  return (
    <Router>
      <Sidebar />
      <Switch>
        <Route path="/principal" exact component={Overview} />
        <Route path="/reportes" exact component={Reports} />
        <Route path="/reportes/reportes1" exact component={ReportsOne} />
        <Route path="/reportes/reportes2" exact component={ReportsTwo} />
        <Route path="/reportes/reportes3" exact component={ReportsThree} />
        <Route path="/team" exact component={Team} />
      </Switch>
    </Router>
  );
}

export default App;
