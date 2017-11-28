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

const welcomeMessage = (user) => {
  return [
    {
      text: `안녕하세요?`,
    },
    {
      text: `저는 당신의 감정을 연구하는 감정케어 타로봇 자두에요.`,
    },
  ]
};

const sayStartTarotMessage = (user) => {
  return [
    {
      text: `${user.first_name}님의 성향을 알아보는 개인 타로카드를 뽑아보시겠어요??`,
    },
    {
      text: `개인 타로카드는 본인의 생년월일을 토대로 선택 됩니다. `,
    },
    {
      text: `생년월일을 말씀해 주시겠어요?`,
    },
    {
      text: `예시) 1991년05월19일 로 적어주세요. `,
    },
  ]
};

const tarotProcessMessage = (user) => {
  return [
    {
      text: `${user.first_name}님의 성향을 알아보는 개인 타로카드를 뽑아보시겠어요??`,
    },
    {
      text: `잠시만 기다려 줄래요?`,
    },
    {
      text: `하쿠나마타타 폴레폴레❤️`,
    },
    {
      text: `좋은 기운을 넣어줄 주문을 외우고 있어요!`,
    },
    {
      text: `이제 결과가 다 나왔어요!`,
    },
    {
      text: `당신의 운명의 카드는 바로 이 카드에요.`,
    },
  ]
};

const tarotResultMessage = (user, tarotNumber) => {
  return [
    {
      text: `당신의 운명의 카드는 ${tarotNumber}`,
    },
    {
      text: `어떠신가요?`,
    },
    {
      text: `${user.first_name}님의 운명의카드에 대한 해설이?`,
    },
    {
      text: `맘에드시나요??`,
    },
  ]
};

const welcomeReplies = {
  text: "어떤 테스트 해볼래요? ",
  quick_replies: [
     {
      content_type: 'text',
      title: '성향테스트',
      payload: JSON.stringify({
        type: 'SAY_TAROT_TEST',
      })
    },
    {
      content_type: 'text',
      title: '심리테스트',
      payload: JSON.stringify({
        type: 'SAY_START_TEST',
      })
    },
    {
      content_type: 'text',
      title: '안할래...',
      payload: JSON.stringify({
        type: 'SAY_STOP_TEST',
      })
    }
  ]
}

const sayStartTestMessage = (description) => {
  return {
    text: `${description}`
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

const sendTarotImageMessage = (tarotNumber) => {
  return {
    attachment: {
      type: "image", 
      payload: {
        url: `${SERVER_URL}/media/card-images/card_default_${tarotNumber}.jpeg`, 
        is_reusable: true
      }
    }
  }
}

const sendSayHiMessage = [
  {
    text: '안녕?'
  },
  {
    text: 'ㅎㅇ!'
  },
  {
    text: `what's up dude?!`
  },
]

const sendNiceMeetMessage = [
  {
    text: '방가방가!'
  },
  {
    text: '만나서 반갑습니다.'
  },
  {
    text: `헿..`
  },
]

const sendCallMeMessage = [
  {
    text: '나 불렀어?!?'
  },
  {
    text: '왜 불러?'
  },
  {
    text: `what's happen?!`
  },
]

const sendDontUnderstandMessage = [
  {
    text: '무슨말인지 모르겠어'
  },
  {
    text: '?!?'
  },
  {
    text: `... ?? ...`
  },
]

const sendTestText = [
  {
    text: '타고난 자유로운 영혼을 가진 사람이에요.'
  },
  {
    text: '본성자체가 자유로운 사람이라, 무모한 도전에 두려워하지 않고, 모험을 즐기는 사람이죠.'
  },
  {
    text: `단순하고 순수하기 때문에 많은 사람들이 도움을 주고,`
  },
  {
    text: `당신을 좋아하기 때문에, 나름의 기준을 가지고 행복하게 살아가고 있대요.`
  },
  {
    text: `사회에서는 조금 부족하거나, 조심성이 없다는 평을 들을때도 있지만,`
  },
  {
    text: `무언가에 빠지면 열정적인 타입이라 미워할수 없는 타입이라고 해요.^^`
  },
]

export default {
  // init settings
  persistentMenu,
  getStarted,
  greetingMessage,

  // welcome
  welcomeMessage,
  welcomeReplies,

  sayStartTarotMessage,
  tarotProcessMessage,
  tarotResultMessage,

  sayStartTestMessage,
  sayStopTestMessage,
  testResultMessage,

  // 
  twoButtonMessage,

  itemOptionsText,
  itemOptionsCarosel,

  // etc
  // selectLanguageMessage,
  sendTarotImageMessage,
  
  sendSayHiMessage,
  sendNiceMeetMessage,
  sendCallMeMessage,
  
  sendDontUnderstandMessage,
  
  sendTestText,
};
