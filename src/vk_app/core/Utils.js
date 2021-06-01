export function copyObj(mainObj) {
  let objCopy = {}; // objCopy будет хранить копию mainObj
  let key;

  for (key in mainObj) {
    objCopy[key] = mainObj[key]; // копирует каждое свойство objCopy
  }
  return objCopy;
}