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
// ThreadSetup.setGreeting();
ThreadSetup.setGetStarted();

db.connect();
// mongoose.connect(process.env.MONGODB_URL, {
//   useMongoClient: true,
// });

// const db = mongoose.connection;
// db.on('error', console.error);
// db.once('open', () => {
//   console.log('connected to mongodb server');
// });

server.listen();
