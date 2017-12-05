import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import Opps from './Opps';

window.attachApp = (userId) => {
  console.log('attachApp, ', userId, 'fb, ',FB);
  if (userId) {
    ReactDOM.render(<App userId={userId}/>, document.getElementById('content'));
  } else {
    ReactDOM.render(<App />, document.getElementById('content'));
  }
}

