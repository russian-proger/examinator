import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import './Code.sass';

// Набор ключевых слов
const keywords = ["using", "namespace", "int", "double", "float", "bool", "long"];
const constants = ["_USE_MATH_DEFINES", "LC_ALL", "M_PI"];
const operators = ["for", "if", "while", "do", "else"];
const specials = ["endl"];

/**
 * 
 * @param {Object} param0 
 * @param {string} param0.code 
 */
export default function Code({ code: _code }) {
  const app = React.useContext(CoreProvider);
  const code = React.useMemo(() => {
    var result = "";
    var level = 0;
    _code.split('\n').forEach(codeLine => {
      result += "<span class=\"code-line\"> ";

      // Предназначено для хранения типов каждого символа
      // 0 - обычный
      // 1 - число
      // 2 - переменная
      // 3 - строка
      // 4 - константа
      // 5 - ключевое слово
      // 6 - директива
      // 7 - специальное или функция
      // 8 - оператор
      
      if (codeLine.length != 0){ 
        const mask = new Uint8Array(codeLine.length).fill(0);

        // Регулярные выражения
        const reg_strings = /"[^"]*"/gu;
        const reg_includes = /#include\s<[^<>\s]*>/g;
        const reg_numbers = /[^a-zA-Z_]\d+(\.)?\d*/g;
        const reg_vars = /[a-zA-Z0-9_]+/g;
        const reg_functions = /[a-zA-Z_][a-zA-Z0-9_]*(?=\()/g;
        const reg_directs = /#\w+/g;

        var count = 0;
        for (var i = reg_strings.exec(codeLine); i != null; i = reg_strings.exec(codeLine)) {
          if (mask[i.index] != 0) continue;
          for (var j = 0; j < i[0].length; ++j) {
            mask[j + i.index] = 3;
          }
        }
        for (var i = reg_includes.exec(codeLine); i != null; i = reg_includes.exec(codeLine)) {
          if (mask[i.index + 9] != 0) continue;
          for (var j = 0; j < i[0].length; ++j) {
            mask[j + i.index + 9] = 3;
          }
        }

        for (var i = reg_numbers.exec(codeLine); i != null; i = reg_numbers.exec(codeLine)) {
          if (mask[i.index + 1] != 0) continue;
          for (var j = 0; j < i[0].length; ++j) {
            mask[j + i.index + 1] = 1;
          }
        }

        for (var i = reg_directs.exec(codeLine); i != null; i = reg_directs.exec(codeLine)) {
          if (mask[i.index] != 0) continue;
          for (var j = 0; j < i[0].length; ++j) {
            mask[j + i.index] = 6;
          }
        }

        for (var i = reg_vars.exec(codeLine); i != null && i.length != 0; i = reg_vars.exec(codeLine)) {
          if (count++ > 50) break;
          if (mask[i.index] != 0) continue;
          var color = 2;
          if (constants.indexOf(i[0]) != -1) {
            color = 4;
          } else if (keywords.indexOf(i[0]) != -1) {
            color = 5;
          } else if (specials.indexOf(i[0]) != -1) {
            color = 7;
          } else if (operators.indexOf(i[0]) != -1) {
            color = 8;
          }
          for (var j = 0; j < i[0].length; ++j) {
            mask[j + i.index] = color;
          }
        }

        for (var i = reg_functions.exec(codeLine); i != null; i = reg_functions.exec(codeLine)) {
          if (mask[i.index] == 3) continue;
          for (var j = 0; j < i[0].length; ++j) {
            mask[j + i.index] = 7;
          }
        }

        for (var i = 0; i < codeLine.length;) {
          result += `<span class="c-${mask[i]}">${app.String.escapeHTMLEntities(codeLine[i])}`
          var j = i + 1;
          for (; j < codeLine.length && mask[j] == mask[j - 1]; ++j) {
            result += app.String.escapeHTMLEntities(codeLine[j]);
          }
          result += "</span>";
          i = j;
        }
      }
      
      result += "</span>";
    });
    return result;
  }, [_code]);

  return (
    <pre className="code-wrapper">
      <code className="code-container" dangerouslySetInnerHTML={{ __html: code }}></code>
    </pre>
  )
}