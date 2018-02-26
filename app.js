import path from 'path';
import fs from 'fs';
import db from './database';

import Server from './server';
import dataHelper from './messenger-api-helpers/dataHelper';

// messenger!
import ThreadSetup from './messenger-api-helpers/thread-setup';

const server = new Server();

try {
  const jsonData = fs.readFileSync(path.join(__dirname, 'public/data.json'));
  const json = JSON.parse(jsonData);

  dataHelper.setData(json);
} catch (e) {
  console.log('error, ', e);
}

ThreadSetup.setDomainWhitelisting();
ThreadSetup.setPersistentMenu();
ThreadSetup.setGetStarted();


db.connect();

if (process.env.BOT_DEV_ENV === 'dev') {
  server.listen();
} else {
  server.httpListen(process.env.PORT_80 || 8080);
  server.httpsListen(process.env.SSL_PORT || 8443);
}
