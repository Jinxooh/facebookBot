// ===== STORES ================================================================
import Store from './store';

// ===== MODELS ================================================================
import Question from '../models/question';

class QuestionStore extends Store {
  constructor() {
    super();
  }

  getByQuestionId(questionId) {
    return [...this.data.values()]
    .filter((question) => question.id === questionId);
  }

  insert(question) {
    return this.set(question.id, question);
  }

  getDescription(questionId) {
    const [ question ] = this.getByQuestionId(questionId)
    return question.description;
  }

  getYesOrNoNext(questionId, yesOrNo) {
    const [ question ] = this.getByQuestionId(questionId)
    return question[yesOrNo];
  }

  createStore(questionList) {
    questionList.map((item) => {
      this.insert(new Question(item.id, item.description, item.yes, item.no))
    });
    return this;
  }
}

export default QuestionStore;