export function Test() {
  /** @type{string} */
  this.condition;
  
  /** @type{Array<string>} */
  this.options;
  
  /** @type{string|Number} */
  this.answer;

  /** @type{string} */
  this.type;
}

const tests = {};
export function loadTests() {
  fetch("/static/informatics.json").then(response => response.json()).then(data => {
    tests.informatics = data;
  });
}

export { tests };