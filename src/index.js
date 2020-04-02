import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import App from './components/App.tsx';
import './styles/index.module.scss';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" render={() => <App demo={false} demoData={''} />}></Route>
      <Route
        path="/demo/:id"
        render={props => (
          <App demo={true} demoId={props.match.params.id} key={props.match.params.id} />
        )}
      ></Route>
      <Route path="/demo" render={props => <App demo={true} demoId={'MaureenDemo'} />}></Route>
    </Switch>
  </Router>,
  rootElement
);
