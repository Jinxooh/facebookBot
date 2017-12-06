import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import Opps from './Opps';

window.attachApp = (userId) => {
  // console.log('attachApp, ', userId, 'fb, ',FB);
  if (userId) {
    ReactDOM.render(<Opps />, document.getElementById('content'));
  } else {
    // ReactDOM.render(<Opps />, document.getElementById('content'));
    ReactDOM.render(<App />, document.getElementById('content'));
  }
}

