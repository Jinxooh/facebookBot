import concat from 'lodash/concat';
import reduce from 'lodash/reduce';

const SERVER_URL = process.env.BOT_DEV_ENV == 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const JADOO_URL = process.env.JADOO_URL;

const linkButton = {
  title: '자두가 좋아요!',
  type: 'web_url',
  url: `${JADOO_URL}`,
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

/**
 * The persistent menu for users to use.
 */
const persistentMenu = {
  setting_type: 'call_to_actions',
  thread_state: 'existing_thread',
  call_to_actions: [
  ],
};

// setting greeting default
const greetingMessage = {
  setting_type: 'greeting',
  greeting: {
    "text": `안녕하세요! 👋{{user_first_name}}님👋 저는 당신의 감정을 연구하는 감정케어 상담봇 자두 입니다. 입력란에 '자두야 놀자' 입력하시면 시작됩니다. 즐거운 시간 되세요!`
  }
};

const welcomeMessage = (user) => {
  return [
    {
      text: `안녕하세요?`,
    },
    {
      text: `저는 당신의 감정을 연구하는 감정케어 상담봇 자두에요.`,
    },
  ]
};

const sayStartTarotMessage = (user) => {
  return [
    {
      text: `${user.first_name}님의 성향을 알아보는 나의 운명의 카드를 뽑아보시겠어요??`,
    },
    {
      text: `운명의 카드는 본인의 생년월일을 토대로 선택 됩니다. `,
    },
    {
      text: `생년월일을 말씀해 주시겠어요?`,
    },
    {
      text: `예시) 1991년05월19일 또는 1991/05/19 로 적어주세요.`,
    },
  ]
};

const tarotProcessMessage = (user) => {
  return [
    {
      text: `${user.first_name}님의 운명의 카드는 무엇인지 찾고 있어요.`,
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

const tarotResultMessage = (user, tarotData) => {
  const tarotDescription = reduce(tarotData.tarotDescription, (result, item, index) => {
    result[index] = {text: item};
    return result;
  }, []);
  
  return concat(
    { text: `당신의 운명의 카드는 '${tarotData.tarotName}' 입니다.` },
    { text: `${user.first_name} 님은` },
    tarotDescription,
    { text: `어떠신가요?` },
    { text: `${user.first_name}님의 운명의카드에 대한 해설이?` },
    { text: `맘에드시나요??` },
  )
};

const thanksMessage = {
  text: `평가해 주셔서 감사합니다. ^^`
}

const answerThanksMessage = () => {
  return [
    { text: `앞으로 더 열심히 공부해서 좋은 서비스로 보답할게요!` },
    {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'button',
          text: `자두에서 매주 별자리 운세서비스를 확인 하고 싶다면 좋아요를 눌러주세요!`,
          buttons: [
            linkButton,
          ],
        },
      }
    },
    { text: `제가 열심히 공부하고 노력해서 좋은정보 많이 공유해드릴게요!` }
  ]
}

const tarotAnswerFailure = (user) => {
  return [
   {text: "다시한번 생년월일을 입력해주세요!"}, 
   {text: `폴레폴레 천천히 다시한번 ${user.first_name}님의 운명의 카드를 위해 기다릴게요!`}
  ]
}

const tarotAnswerFailure3times = () => {
  return [
   {text: "잘 이해하지 못했어요ㅜㅜ"}, 
   {text: "한번만 더 힘을내 입력해주세요! 운명의 카드를 찾기위해 기다리고 있어요!",},
   {text: "예시) 1991년05월19일 또는 1991/05/19 로 적어주세요."}
  ]
}

const sendImageMessage = (url) => {
  return {
    attachment: {
      type: "image", 
      payload: {
        url: `${SERVER_URL}/${url}`, 
        is_reusable: true
      }
    }
  }
}

const welcomeReplies = {
  text: "나랑 재밌는 테스트 한번 해볼래요??",
  quick_replies: [
     {
      content_type: 'text',
      title: '1. 나의 운명의 카드 찾기',
      payload: JSON.stringify({
        type: 'SAY_TAROT_TEST',
      })
    },
    {
      content_type: 'text',
      title: '2. 나의 허세지수 알아보기',
      payload: JSON.stringify({
        type: 'SAY_START_TEST',
      })
    },
  ]
}

const sayStartTestMessage = (description) => {
  return {
    text: `${description}`
  }
}

const requestRestartMessage = {
  text: `다시 '자두야 놀자'라고 부르면 다른 테스트를 시작할 수 있어요.`
}

const postbackYesButton = {
  type: 'postback',
  title: '네',
  payload: JSON.stringify({
    type: 'SAY_YES_POSTBACK',
  })
};

const postbackNoButton = {
  type: 'postback',
  title: '아니요',
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
]

const sendNiceMeetMessage = [
  {
    text: '방가방가!'
  },
]

const sendDontUnderstandMessage = [
  {
    text: '무슨말인지 모르겠어'
  },
]

export default {
  // init settings
  getStarted,
  greetingMessage,

  // welcome
  welcomeMessage,
  welcomeReplies,

  sayStartTarotMessage,
  tarotProcessMessage,
  tarotResultMessage,
  
  thanksMessage,
  answerThanksMessage,

  tarotAnswerFailure,
  tarotAnswerFailure3times,

  sayStartTestMessage,
  requestRestartMessage,

  // 
  twoButtonMessage,

  sendTarotImageMessage,
  
  sendSayHiMessage,
  sendNiceMeetMessage,
  
  sendDontUnderstandMessage,
  
  sendImageMessage,
};
