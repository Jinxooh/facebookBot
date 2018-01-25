import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import favicon from 'serve-favicon';

import routes from './routes';

export default class Server {
  constructor() {
    this.app = express();
    this.middleware();
  }

  middleware() {
    const { app } = this;
    app.set('port', (process.env.PORT || 5000));

    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());

    app.set('view engine', 'ejs');
    app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', routes);
  }

  listen() {
    const { app } = this;
    app.listen(app.get('port'));
    console.log('running on Port ', app.get('port'));
  }
}
