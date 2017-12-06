import React, { Component } from 'react';
import Button from './Button';

class App extends Component {
  handleFacebookButtonClick = () => {
    FB.ui(
      {
        method: 'share',
        href: 'https://d3f44223.ngrok.io',
        hashtag: '#jadoo',
      },
      // callback
      function(response) {
        if (response && !response.error_message) {
          console.log('Posting completed.');
        } else {
          console.log('Error while posting.');
        }
      }
    );
  };

  render() {
    return (
      <div>
        <Button handleClick={this.handleFacebookButtonClick}></Button>
      </div>
    );
  }
}

export default App;
