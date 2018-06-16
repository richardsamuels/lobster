// @flow
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Actions from './actions';
import 'babel-polyfill';
import 'url-search-params-polyfill';

import './index.css';

import App from './components/App';

const root = document.getElementById('root');

if (root != null) {
  ReactDOM.render((
    <BrowserRouter>
      <App Actions={Actions} />
    </BrowserRouter>
  ), root);
}
