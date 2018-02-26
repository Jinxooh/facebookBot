import express from 'express';
import https from 'https';
import http from 'http';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';

import routes from './routes';

export default class Server {
  constructor() {
    this.app = express();
    this.httpRedirect = express();
    this.middleware();
  }

  middleware() {
    const { app, httpRedirect } = this;

    app.set('port', (process.env.PORT || 5000));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.set('view engine', 'ejs');
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', routes);

    // httpRedirect.all('*', (req, res, next) => {
    //   if (/^http$/.test(req.protocol)) {
    //     const host = req.headers.host.replace(/:[0-9]+$/g, ""); // strip the port # if any
    //     return res.redirect(301, `https://${host}${req.url}`);
    //   }
    //   return next();
    // });
  }

  listen() {
    const { app } = this;
    app.listen(app.get('port'));
    console.log('running on Port ', app.get('port'));
  }

  httpListen(port) {
    const { httpRedirect } = this;
    http.createServer(httpRedirect).listen(port, () => console.log('Http server listening on port', port));
  }

  httpsListen(port) {
    const { app } = this;
    const rootDir = '/etc/letsencrypt/live/jadoochat.standard.kr';
    const options = {
      ca: fs.readFileSync(`${rootDir}/chain.pem`),
      key: fs.readFileSync(`${rootDir}/privkey.pem`),
      cert: fs.readFileSync(`${rootDir}/cert.pem`),
    };

    https.createServer(options, app).listen(port, () => console.log('Https server listening on port ', port));
  }
}
