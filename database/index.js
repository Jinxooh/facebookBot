import mongoose from 'mongoose';
import log from '../lib/log';

const {
  MONGODB_URL: mongoURI,
  TEST_MONGODB_URL: mongoTestURI,
} = process.env;
// console.log(mongoURI);

export default (() => {
  mongoose.Promise = global.Promise;
  return {
    connect() {
      return mongoose.connect(process.env.BOT_DEV_ENV === 'dev' ? mongoTestURI : mongoURI)
        .then(() => log.info('Successfully connected to mongodb'))
        .catch(e => log.error(e));
    },
    disconnect() {
      return mongoose.disconnect();
    },
  };
})();
