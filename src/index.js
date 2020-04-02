import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import App from './components/App.tsx';
import './styles/index.module.scss';
import test from './fixtures/MaureenMcodeDemoPatientRecords.json';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" render={() => <App demo={false} demoData={''} />}></Route>
      <Route path="/demo/:id" children={<CustomDemo />} />
      <Route path="/demo" render={() => <App demo={true} demoData={test} />}></Route>
    </Switch>
  </Router>,
  rootElement
);

function CustomDemo() {
  const [demoData, setDemoData] = useState(test);
  const [lastId, setLastId] = useState('');
  let { id } = useParams();

  console.log('index.js - id used: ' + id + ' which has birthday ' + demoData[0].birthDate);
  if (lastId !== id) {
    setLastId(id);
    // update this hardcoded url
    let url = 'http://localhost:3000/static/demoData/' + id + '.json';
    console.log('index.js - fetch: ' + url);

    fetch(url)
      .then(cql => cql.json())
      .then(result => {
        console.log('index.js - fetch done');
        setDemoData(result);
      });
  }
  return <App demo={true} demoData={demoData} />;
}
