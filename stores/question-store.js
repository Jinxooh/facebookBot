// ===== STORES ================================================================
import Store from './store';

// ===== MODELS ================================================================
import Question from '../models/question';

class QuestionStore extends Store {
  constructor() {
    super();

    this.current = null;
    this.next = null;
    this.description = '';
  }

  getByQuestionId(questionId) {
    return [...this.data.values()]
    .filter((question) => question.id === questionId);
  }

  insert(question) {
    return this.set(question.id, question);
  }

  getCurrent() {
    return this.current;
  }

  setCurrent(current) {
    this.current = current;
  }

  setDescription() {
    const [ question ] = this.getByQuestionId(this.current)
    this.description = question.description;
  }

  getDescription(questionId) {
    const [ question ] = this.getByQuestionId(questionId)
    return question.description;
  }

  getNext(next) {
    return this.next;
  }

  setNext(next) {
    this.next = next;
  }

  selectYes() {
    const [ question ] = this.getByQuestionId(this.current)
    return question.yes;
  }

  selectNo() {
    const [ question ] = this.getByQuestionId(this.current)
    return question.no;
  }

  createStore(questionList) {
    questionList.map((item) => {
      this.insert(new Question(item.id, item.description, item.yes, item.no))
    });
    return this;
  }
}

// const QUESTION_STORE_1 = new QuestionStore();
// const QUESTION_STORE_2 = new QuestionStore();
// const data = [
//   { id: '1', yes: '2', no: 'A', description: '나는 내가 가치있는 사람이라고 생각한다.' },
//   { id: '2', yes: '5', no: '4', description: 'SNS에 좋아요가 없으면 기분이 좋지 않다.' },
//   { id: '3', yes: '6', no: '4', description: '나는 편의점 커피보다 스타벅스에서 마시는 커피를 선호한다.' },
//   { id: '4', yes: '8', no: '7', description: '명품이면 디자인이 맘에 들지 않아도 좋다고 생각한다.' },
//   { id: '5', yes: '7', no: 'A', description: '한가지 이미지로 살기엔 인생이 너무 노잼이라 생각한다.' },
//   { id: '6', yes: '9', no: '13', description: '돈이 없어도 나는 사고 싶은 건 사야 한다!' },
//   { id: '7', yes: '11', no: '10', description: 'SNS에 글을 쓸때 다른 사람들이 어떻게 볼까  의식하며 쓴 적이 있다.' },
//   { id: '8', yes: '12', no: '10', description: '영화를 보더라도 꼭 아이맥스나 스페셜 상영관에서 보는걸 선호한다.' },
//   { id: '9', yes: '15', no: '8', description: '나의 업무는 내 만족이 아닌 대외적인 시선이 더 중요하다!' },
//   { id: '10', yes: '13', no: 'B', description: '나의 페이스북에 ‘좋아요’가 많을수록 기분이 우쭐해진다.' },
//   { id: '11', yes: '15', no: 'B', description: 'SNS에서 피드를 보다가 누가 무엇을 사면 나도 따라서 사고 싶은 생각이 든다!' },
//   { id: '12', yes: '14', no: '13', description: '다른 사람들에게 이야기 할때  MSG 첨가는 필수다!' },
//   { id: '13', yes: '14', no: '11', description: '특별한 일이 없어도 주변인들의 시선을 받고 싶어 SNS를 가끔씩 탈퇴한다.' },
//   { id: '14', yes: 'C', no: 'B', description: '무슨일을 하든 내 모습을 남들이 어떻게 볼까 궁금하다.' },
//   { id: '15', yes: 'D', no: 'C', description: '늘 밝게 지내기 보다 가끔은 우울하고 슬퍼지고 싶다.' },
//   { id: 'A', description: '‘나만 믿어’ 타입, 자신감이 넘치는 당신. 남들이 부러워할 만큼 뚝심 있게 살고 있네요. 하지만 때로는 공동체 사회에서 너무 독단적으로 사는 건 아닌지 한번 쯤 생각해볼 필요도 있답니다.' },
//   { id: 'B', description: '‘흔들리는 바람’ 타입, 내 삶의 이유는 바로 당신들 때문? 우아하게 살고 싶은데. 이런 나를 부러운 눈으로 바라보는 사람들이 필요합니다. 진정한 내 삶에 무엇이 필요한지 한번쯤 돌아보는 게 좋을 것 같아요.' },
//   { id: 'C', description: '‘우아~우아하게’ 타입, 자신감이 넘치는 당신. 남들이 부러워할 만큼 뚝심 있게 살고 있네요. 하지만 때로는 공동체 사회에서 너무 독단적으로 사는 건 아닌지 한번 쯤 생각해볼 필요도 있답니다.' },
//   { id: 'D', description: '‘나야 나’ 타입, 오늘 밤 주인공은 나야 나! 네맘을 훔칠 사람 나야 나! 허세로 살아가는 당신. 허세로 똘똘뭉친 당신은 행복하신가요??' },
// ]



// data.map((item) => {
//   QUESTION_STORE_1.insert(new Question(item.id, item.description, item.yes, item.no))
//   QUESTION_STORE_2.insert(new Question(item.id, item.description, item.yes, item.no))
// });

export default QuestionStore;