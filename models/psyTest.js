/**
 * PsyTest Model
 *
 * @class PsyTest
 */
export default class PsyTest {
  /**
   * Create a PsyTest
   *
   * @param {string} id - Unique idenitifier of this PsyTest.
   * @param {string} name - Name of the PsyTest.
   * @param {string} description - Description of the PsyTest.
   * @param {object} questionList - Question List.
   */
  constructor(id, name, description, questionList) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.questionList = questionList;
  }
}