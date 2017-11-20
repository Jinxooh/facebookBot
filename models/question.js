/**
 * Question Model
 *
 * @class Question
 */
export default class Question {

  /**
   * Create a Question
   *
   * @param {string} id - Unique idenitifier of this Question.
   * @param {string} description - Description of the Question.
   * @param {string} yes - yes Question id.
   * @param {string} no - no Question id.
   */
  constructor(id, description, yes, no) {
    this.id = id;
    this.description = description;
    this.yes = yes;
    this.no = no;
  }
}