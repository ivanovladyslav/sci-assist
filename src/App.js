import React, {Component, useCallback} from 'react';
import { BrowserRouter as Router, Switch, Route, Link, useHistory, withRouter } from 'react-router-dom';
import axios from 'axios';

import Workspace from './components/workspace';
import Dashboard from './components/dashboard';

const url = process.env.REACT_APP_LOCALHOST_URL;

class App extends Component {  
  render() {
    return (
      <Workspace />
    )
  }
}

export default App;
