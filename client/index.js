import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import Opps from './Opps';

window.attachApp = (userId) => {
  if (userId) {
    ReactDOM.render(<App userId={userId}/>, document.getElementById('content'));
  } else {
    ReactDOM.render(<Opps />, document.getElementById('content'));
  }
}