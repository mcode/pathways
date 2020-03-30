import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import App from './components/App.tsx';
import './styles/index.module.scss';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" render={() => <App demo={false} id={''} />}></Route>
      <Route path="/demo/:id" children={<Child />} />
      <Route path="/demo" render={() => <App demo={true} id={'MaureenDemo'} />}></Route>
    </Switch>
  </Router>,
  rootElement
);

function Child() {
  let { id } = useParams();
  return <Route render={() => <App demo={true} id={id} />} />;
}
