import mongoose from 'mongoose';
import log from '../lib/log';

const {
  MONGODB_URL: mongoURI,
} = process.env;
console.log(mongoURI);

export default (() => {
  mongoose.Promise = global.Promise;
  return {
    connect() {
      return mongoose.connect(mongoURI)
        .then(() => log.info('Successfully connected to mongodb'))
        .catch(e => log.error(e));
    },
    disconnect() {
      return mongoose.disconnect();
    },
  };
})();