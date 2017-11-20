const SERVER_URL = process.env.BOT_DEV_ENV == 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;

const urlButton = {
  type: 'web_url',
  url: `${SERVER_URL}/`,
  title: 'go to url',
  webview_height_ratio: 'compact',
  messenger_extensions: true,
};

const postbackButton = {
  type: 'postback',
  title: 'postback',
  payload: JSON.stringify({
    type: 'SOMETHING',
  })
};

const viewDetailsButton = (id) => {
  return {
    title: 'View Details',
    type: 'web_url',
    url: `${SERVER_URL}/details/${id}`,
    webview_height_ratio: 'compact',
    messenger_extensions: true,
  };
};

const chooseButton = {
  title: 'chooseButton',
  type: 'web_url',
  url: `${SERVER_URL}/choose/`,
  webview_height_ratio: 'tall',
  messenger_extensions: true,
};

/**
 * The persistent menu for users to use.
 */
const persistentMenu = {
  setting_type: 'call_to_actions',
  thread_state: 'existing_thread',
  call_to_actions: [
    urlButton,
    postbackButton
  ],
};

/**
 * The Get Started button.
 */
const getStarted = {
  setting_type: 'call_to_actions',
  thread_state: 'new_thread',
  call_to_actions: [
    {
      payload: JSON.stringify({
        type: 'GET_STARTED',
      }),
    },
  ],
};

// setting greeting default
const greetingMessage = {
  setting_type: 'greeting',
  greeting: {
    "text": "안녕하세요! 👋{{user_first_name}}님👋"
  }
};

const welcomeMessage = (userInfo) => {
  return {
    text: `안녕하세요 ${userInfo.first_name}님`,
  }
};

const welcomeReplies = {
  text: "심리테스트 한번 해볼래요? ",
  quick_replies: [
    {
      content_type: 'text',
      title: '네',
      payload: JSON.stringify({
        type: 'SAY_START_TEST',
      })
    },
    {
      content_type: 'text',
      title: '아니요',
      payload: JSON.stringify({
        type: 'SAY_STOP_TEST',
      })
    }
  ]
}

const sayStartTestMessage = (psyTest) => {
  return {
    text: `${psyTest.description}`
  }
}

const sayStopTestMessage = {
  text: '알겠어요. 언제든지 심리테스트를 하고 싶다면, ‘시작’을 써주세요.^^'
}

const testResultMessage = {
  text: '언제든지 다시 심리테스트를 하고 싶다면, ‘시작’을 써주세요.^^'
}

const postbackYesButton = {
  type: 'postback',
  title: 'Yes',
  payload: JSON.stringify({
    type: 'SAY_YES_POSTBACK',
  })
};

const postbackNoButton = {
  type: 'postback',
  title: 'No',
  payload: JSON.stringify({
    type: 'SAY_NO_POSTBACK',
  })
};

const twoButtonMessage = (description) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: `${description}`,
        buttons: [
          postbackYesButton,
          postbackNoButton
        ],
      },
    }
  }
};

const itemOptionsText = {
  text: 'Here are item options for you:',
}

const itemList = () => {
  return [
    {
      title: 'name1',
      image_url: `${SERVER_URL}/media/test/10.jpg`,
      subtitle: '1 description!!',
      buttons: [
        viewDetailsButton('1_id'),
        chooseButton
      ],
    },
    {
      title: 'name2',
      image_url: `${SERVER_URL}/media/test/20.jpg`,
      subtitle: '2 description!!',
      buttons: [
        viewDetailsButton('2_ids'),
        chooseButton
      ],
    },
    {
      title: 'name3',
      image_url: `${SERVER_URL}/media/test/30.jpg`,
      subtitle: '3 description!!',
      buttons: [
        viewDetailsButton('3_ids'),
        chooseButton
      ],
    }
  ]
}

const itemOptionsCarosel = (recipientId) => {
  // const user = UserStore.get(recipientId) || UserStore.insert({id: recipientId});
  // const giftOptions = user.getRecommendedGifts();

  // const carouselItems = giftOptions.map(giftToCarouselItem);

  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: itemList()
      },
    },
  };
};

const sendImageMessage = {
  attachment: {
    type: "image", 
    payload: {
      url: `${SERVER_URL}/media/test/30.jpg`, 
      is_reusable: true
    }
  }
}

const selectLanguageMessage = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'button',
      text: 'Choose your language!😉'
    }
  }
}

export default {
  // init settings
  persistentMenu,
  getStarted,
  greetingMessage,

  // welcome
  welcomeMessage,
  welcomeReplies,

  sayStartTestMessage,
  sayStopTestMessage,
  testResultMessage,
  // 
  twoButtonMessage,

  itemOptionsText,
  itemOptionsCarosel,

  // etc
  selectLanguageMessage,
  sendImageMessage,
};
