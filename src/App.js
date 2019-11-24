import React, {Component, useCallback} from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import Workspace from './components/workspace';
import Dashboard from './components/dashboard';

class App extends Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route path="/">
            <Workspace/>
          </Route>
          <Route path="/dashboard">
            <Dashboard/>
          </Route>
        </Switch>
      </Router>
    )
  }
}

export default App;
