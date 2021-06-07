import React from 'react';

import katex from 'katex';

function transform(text, pattern, replaceFunction) {

  let expressions = text.match(pattern);
  if (expressions != null) {
    for (let exp of expressions) {
      text = text.replace(exp, replaceFunction(exp));
    }
  }
  return text;
}

export function HtmlKatex({ text }) {
  const html = React.useMemo(() => {
    let result = text;
    result = transform(result, /###.+?###/g, v => katex.renderToString(v.slice(3, -3)));
    result = transform(result, /\$\$\$\$.+?\$\$\$\$/g, v => {
      let a = v.slice(4, -4).split('$');
      return `<a class="solve-link" href="${a.slice(1).join('$')}" target="_blank">${a[0]}</a>`;
    }, []);

    return result;
  }, [text])

  return (
    <span dangerouslySetInnerHTML={{ __html: html }}></span>
  );
}