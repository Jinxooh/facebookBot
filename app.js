// modules
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import fs from 'fs';
import favicon from 'serve-favicon';
import mongoose from 'mongoose';
import dataHelper from './messenger-api-helpers/dataHelper';

// messenger!
import ThreadSetup from './messenger-api-helpers/thread-setup';

// ===== ROUTES ================================================================
import share from './routes/share';
import webhooks from './routes/webhooks';
import end from './routes/end';

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', express.static(path.join(__dirname, 'views/')));

app.use('/share', share);
app.use('/webhook', webhooks);
app.use('/end', end);

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

mongoose.connect(process.env.MONGODB_URL, {
  useMongoClient: true,
});

const db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('connected to mongodb server');
});

app.listen(app.get('port'), () => {
  console.log('running on port', app.get('port'));
});
