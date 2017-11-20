import messages from './messages';
import api from './api';

const SERVER_URL = process.env.BOT_DEV_ENV == 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
/**
 * Adds the server url to the Messenger App's whitelist.
 *
 * This is required to use Messenger Extensions which
 * this demo uses to get UserId's from a Messenger WebView.
 *
 * @returns {undefined}
 */
const setDomainWhitelisting = () => {
  api.callThreadAPI(
    {
      setting_type: 'domain_whitelisting',
      whitelisted_domains: [SERVER_URL],
      domain_action_type: 'add',
    },
  );
}

/**
 * Sets the persistent menu for the application
 *
 * @returns {undefined}
 */
const setPersistentMenu = () => {
  api.callThreadAPI(messages.persistentMenu);
};

/**
 * Sets the Get Started button for the application
 *
 * @returns {undefined}
 */
const setGetStarted = () => {
  api.callThreadAPI(messages.getStarted);
};

/**
 * Sets the Get Started button for the application
 *
 * @returns {undefined}
 */
const setGreeting = () => {
  api.callThreadAPI(messages.greetingMessage);
};

export default {
  setDomainWhitelisting,
  setPersistentMenu,
  setGetStarted,
  setGreeting,
};
