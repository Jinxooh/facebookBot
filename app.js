// modules
import bodyParser from 'body-parser';
import express from 'express';
import request from 'request';
import path from 'path';
import fs from 'fs';
import dataHelper from './messenger-api-helpers/database';

// messenger!
import ThreadSetup from './messenger-api-helpers/thread-setup';

// ===== ROUTES ================================================================
import webhooks from './routes/webhooks';

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(path.join(__dirname, 'views/')));
app.use('/webhook', webhooks);

try{
    const file = fs.readFileSync(path.join(__dirname, 'public/data.json'));
    const json = JSON.parse(file);
    dataHelper.setData(json);
} catch(e) {
    console.log('error, ', e);
}

ThreadSetup.setDomainWhitelisting();
ThreadSetup.setGreeting();
ThreadSetup.setPersistentMenu();
ThreadSetup.setGetStarted();

app.listen(app.get('port'), () => {
    console.log('running on port', app.get('port'));
})