
/** @type {string} */
var s;

console.clear();

var result = [];
var pat1 = /^(?:\d*\.\s).*$/gm;

s.match(pat1).forEach((v, i) => {
  var obj = { id: null, question: "", options: [], answer: null, type: null };
  let sr = v.replace(/^\d*\.\s/, '');
  let sd = sr.match(/\+?\d\)/g);
  if (sd == null) {
    console.warn(i);
    return ;
  }
  obj.id = v.match(/\d*/)[0];
  obj.question = sr.slice(0, sr.indexOf(sd[0]));
  
  let answers = [];
  sd.forEach((v, i) => {
    if (v[0] == '+') {
      answers.push(v[1]);
    }

    let a;
    if (i != sd.length - 1) {
      a = sr.slice(sr.indexOf(v) + v.length, sr.indexOf(sd[i + 1]));
    } else {
      a = sr.slice(sr.indexOf(v) + v.length);
    }
    obj.options.push(a.trim());
  });
  obj.type = (answers.length == 1 ? 'radio' : 'select');
  obj.answer = answers.map(v => v - 1).join('');
  result.push(obj);
});

var r = {
  subject_name: "ЭВМ",
  catalog: result
}

console.log(JSON.stringify(r));