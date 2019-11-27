import React from 'react';
import ReactDOM from 'react-dom';
import Files from './components/Files';
import Login from './components/Login';
import Manga from './components/Manga'
import { Route, BrowserRouter as Router } from 'react-router-dom'
import registerServiceWorker from './registerServiceWorker';


const routing = (
  <Router>
    <div>
      <Route exact path="/" component={Login} />
      <Route exact path="/files" component={Files} />
      <Route exact path="/manga" component={Manga} />
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById('root'));

registerServiceWorker();
