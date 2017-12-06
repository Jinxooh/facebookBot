// modules
import bodyParser from 'body-parser';
import express from 'express';
import path from 'path';
import fs from 'fs';
import frameguard from 'frameguard';
import dataHelper from './messenger-api-helpers/database';
import favicon from 'serve-favicon';

// messenger!
import ThreadSetup from './messenger-api-helpers/thread-setup';

// ===== ROUTES ================================================================
import index from './routes/index';
import webhooks from './routes/webhooks';
import share from './routes/share';

const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/', express.static(path.join(__dirname, 'views/')));

app.use('/', index);
app.use('/webhook', webhooks);
app.use('/share', share);

try{
    const psyTestData = fs.readFileSync(path.join(__dirname, 'public/data.json'));
    const json = JSON.parse(psyTestData);

    dataHelper.setData(json);
} catch(e) {
    console.log('error, ', e);
}

ThreadSetup.setDomainWhitelisting();
// ThreadSetup.setGreeting();
ThreadSetup.setGetStarted();

app.listen(app.get('port'), () => {
    console.log('running on port', app.get('port'));
})