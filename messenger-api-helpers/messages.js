import concat from 'lodash/concat';
import dataHelper from './dataHelper';

const SERVER_URL = process.env.BOT_DEV_ENV === 'dev' ? process.env.TEST_SERVER_URL : process.env.SERVER_URL;
const { JADOO_URL } = process.env;

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
  call_to_actions: [{
    payload: JSON.stringify({
      type: 'GET_STARTED',
    }),
  }],
};

const welcomeMessage = {
  text: `안녕하세요? '자두야 놀자' 라고 입력해주시면 테스트가 시작됩니다.`,
};

const startMessage = [
  {
    text: '안녕하세요?',
  },
  {
    text: '저는 당신의 감정을 연구하는 감정케어 상담봇 자두에요.',
  },
  {
    text: '나랑 재밌는 테스트 한번 해볼래요??',
  },
  {
    text: '지금 준비되어 있는 테스트는 두가지 입니다.',
  },
];

const startReplies = {
  text: '채팅창 하단에 있는 두가지 버튼 중에 하나를 눌러주세요',
  quick_replies: [{
    content_type: 'text',
    title: '1. 나의 2018년 별자리운세',
    payload: JSON.stringify({
      type: 'USER_STATE_STAR',
    }),
  },
  {
    content_type: 'text',
    title: '2. 나의 운명의 카드 찾기',
    payload: JSON.stringify({
      type: 'USER_STATE_TAROT',
    }),
  },
  // {
  //   content_type: 'text',
  //   title: '3. 나의 허세지수 알아보기',
  //   payload: JSON.stringify({
  //     type: 'USER_STATE_PSY',
  //   })
  // },
  ],
};

// const psyTestReplies = (description, user) => {
//   const { yes, no } = dataHelper.getQustionData(user);
//   return {
//     text: description || 'f',
//     quick_replies: [{
//       content_type: 'text',
//       title: '네',
//       payload: JSON.stringify({
//         type: 'PSY_ANSWER',
//         data: yes || 'false',
//       }),
//     },
//     {
//       content_type: 'text',
//       title: '아니요',
//       payload: JSON.stringify({
//         type: 'PSY_ANSWER',
//         data: no || 'false',
//       }),
//     }],
//   };
// };

const starTestReplies = (text, data) => {
  const [description] = text;
  return {
    text: description,
    quick_replies: [{
      content_type: 'text',
      title: '볼래',
      payload: JSON.stringify({
        type: 'STAR_ANSWER_YES',
        data,
      }),
    },
    {
      content_type: 'text',
      title: '안볼래',
      payload: JSON.stringify({
        type: 'STAR_ANSWER_NO',
        data,
      }),
    }],
  };
};

const startStarTestMessage = (user) => {
  return [
    {
      text: `${user.first_name}님의 2018년 별자리운세를 알아보시겠어요?`,
    },
    {
      text: '2018년 신년운세는 본인의 생년월일을 입력해주시면 됩니다.',
    },
    {
      text: '생년월일을 말씀해 주시겠어요?',
    },
    {
      text: '예시) 1991년05월19일 또는 1991/05/19 로 적어주세요.',
    },
  ];
};

const starResultMessage = (starData, username, starName) => {
  return concat(dataHelper.arrayToJsonArray(starData, username, starName));
};

const starLastResultMessage = [
  { text: '제가 준비한 2018년 운세는 여기까지 입니다.' },
];

const startTarotMessage = (user) => {
  return [{
    text: `${user.first_name}님의 성향을 알아보는 나의 운명의 카드를 뽑아보시겠어요??`,
  },
  {
    text: '운명의 카드는 본인의 생년월일을 토대로 선택 됩니다.',
  },
  {
    text: '생년월일을 말씀해 주시겠어요?',
  },
  {
    text: '예시) 1991년05월19일 또는 1991/05/19 로 적어주세요.',
  }];
};

const tarotProcessMessage = (user) => {
  return [{
    text: `${user.first_name}님의 운명의 카드는 무엇인지 찾고 있어요.`,
  },
  {
    text: '잠시만 기다려 줄래요?',
  },
  {
    text: '하쿠나마타타 폴레폴레❤️',
  },
  {
    text: '좋은 기운을 넣어줄 주문을 외우고 있어요!',
  },
  {
    text: '이제 결과가 다 나왔어요!',
  },
  {
    text: '당신의 운명의 카드는 바로 이 카드에요.',
  }];
};


const tarotResultMessage = (user, tarotData) => {
  const tarotDescription = dataHelper.arrayToJsonArray(tarotData.tarotDescription);

  return concat(
    {
      text: `당신의 운명의 카드는 '${tarotData.tarotName}' 입니다.`,
    }, {
      text: `${user.first_name} 님은`,
    },
    tarotDescription, {
      text: '어떠신가요?',
    }, {
      text: `${user.first_name}님의 운명의카드에 대한 해설이?`,
    },
  );
};

const reviewReplies = (type, stateName) => {
  return {
    text: 'is it good?',
    quick_replies: [{
      content_type: 'text',
      title: '잘맞아',
      payload: JSON.stringify({
        type,
        data: `${stateName} good`,
      }),
    },
    {
      content_type: 'text',
      title: '안맞아',
      payload: JSON.stringify({
        type,
        data: `${stateName} not good`,
      }),
    },
    {
      content_type: 'text',
      title: '모르겠어',
      payload: JSON.stringify({
        type,
        data: `${stateName} I don't know well`,
      }),
    }],
  };
};

const answerThanksMessage = () => {
  return [{
    text: '평가해 주셔서 감사합니다. ^^',
  },
  {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: '앞으로 더 열심히 공부해서 좋은 서비스로 보답할게요!',
        buttons: [
          linkButton,
        ],
      },
    },
  },
  {
    text: '자두랑 자주 이야기 하고 싶다면 좋아요를 눌러주세요!',
  }];
};

const tarotAnswerFailure = (user) => {
  return [{
    text: '다시한번 생년월일을 입력해주세요!',
  },
  {
    text: `폴레폴레 천천히 다시한번 ${user.first_name}님의 운명의 카드를 위해 기다릴게요!`,
  }];
};

const tarotAnswerFailure3times = () => {
  return [{
    text: '잘 이해하지 못했어요ㅜㅜ',
  },
  {
    text: '한번만 더 힘을내 입력해주세요! 운명의 카드를 찾기위해 기다리고 있어요!',
  },
  {
    text: '예시) 1991년05월19일 또는 1991/05/19 로 적어주세요.',
  }];
};

const sendImageMessage = (url) => {
  return {
    attachment: {
      type: 'image',
      payload: {
        url: `${SERVER_URL}/${url}`,
        is_reusable: true,
      },
    },
  };
};

const sayStartTestMessage = (description) => {
  return {
    text: `${description}`,
  };
};

const requestRestartMessage = {
  text: `'자두야 놀자'라고 부르면 다른 테스트를 시작할 수 있어요.`,
};

const sendTarotImageMessage = (tarotNumber) => {
  return {
    attachment: {
      type: 'image',
      payload: {
        url: `${SERVER_URL}/media/card-images/card_default_${tarotNumber}.jpeg`,
        is_reusable: true,
      },
    },
  };
};

const sendSayHiMessage = [{
  text: '안녕?',
}];

const sendNiceMeetMessage = [{
  text: '방가방가!',
}];

const sendDontUnderstandMessage = [{
  text: '무슨말인지 모르겠어요.',
}];

const sendShareButton = (starNumber) => {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text: '공유하길 원하시면 아래 ‘공유하기’ 버튼을 눌러주세요.',
        buttons: [{
          title: '공유하기',
          type: 'web_url',
          url: `${SERVER_URL}/share/${starNumber}`,
          webview_height_ratio: 'tall',
          messenger_extensions: true,
        }],
      },
    },
  };
};

// const psyTestResultMessage = (user, questionDescription) => {
//   let text;
//   if (isArray(questionDescription)) {
//     text = dataHelper.arrayToJsonArray(questionDescription);
//   } else {
//     text = { text: questionDescription };
//   }

//   return concat(
//     text,
//     {
//       text: `${user.first_name}님의 허세테스트는 어떠셨어요?`,
//     }, {
//       text: '맘에드시나요??',
//     },
//   );
// };

export default {
  // init settings
  getStarted,
  // greetingMessage,

  // welcome
  welcomeMessage,
  startMessage,
  startReplies,

  // contellation
  startStarTestMessage,
  starResultMessage,
  starLastResultMessage,
  starTestReplies,

  // tarot
  startTarotMessage,
  tarotProcessMessage,
  tarotResultMessage,

  // psy
  // psyTestResultMessage,
  // psyTestReplies,

  // review
  reviewReplies,
  answerThanksMessage,

  tarotAnswerFailure,
  tarotAnswerFailure3times,

  sayStartTestMessage,
  requestRestartMessage,

  sendTarotImageMessage,

  sendSayHiMessage,
  sendNiceMeetMessage,

  sendDontUnderstandMessage,

  sendImageMessage,
  sendShareButton,
};
