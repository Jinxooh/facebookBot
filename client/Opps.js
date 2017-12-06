import React from 'react';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom'


const Opps = () => {
  return (
    <Router>
      <Route 
        path="/" 
        component={
          ()=>window.top.location='https://www.facebook.com/v2.11/dialog/share?app_id=552043455131217&channel_url=https%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter%2Fr%2FlY4eZXm_YWu.js%3Fversion%3D42%23cb%3Df142261df6f83a8%26domain%3Dd3f44223.ngrok.io%26origin%3Dhttps%253A%252F%252Fd3f44223.ngrok.io%252Ff2db78b23444fc%26relation%3Dopener&display=popup&e2e=%7B%7D&hashtag=%23jadoo&href=https%3A%2F%2Fd3f44223.ngrok.io&locale=en_US&mobile_iframe=false&next=https%3A%2F%2Fstaticxx.facebook.com%2Fconnect%2Fxd_arbiter%2Fr%2FlY4eZXm_YWu.js%3Fversion%3D42%23cb%3Df2a582f1542d4a%26domain%3Dd3f44223.ngrok.io%26origin%3Dhttps%253A%252F%252Fd3f44223.ngrok.io%252Ff2db78b23444fc%26relation%3Dopener%26frame%3Df5f4d885160ee4%26result%3D%2522xxRESULTTOKENxx%2522&sdk=joey&version=v2.11'
        }
      />
    </Router>
  );
};

export default Opps;