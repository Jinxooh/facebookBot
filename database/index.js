import mongoose from 'mongoose';
import log from 'lib/log';

const {
  TEST_MONGO_URI: mongoURI,
} = process.env;

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

