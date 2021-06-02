import React from 'react';

import katex from 'katex';

export function HtmlKatex({ text }) {
  const html = React.useMemo(() => {
    let result = text;
    
    const pattern = /###.+?###/g;

    let expressions = text.match(pattern);
    if (expressions != null) {
      for (let exp of expressions) {
        result = result.replace(exp, katex.renderToString(exp.slice(3, -3)));
      }
    }

    return result;
  }, [text])

  return (
    <span dangerouslySetInnerHTML={{ __html: html }}></span>
  );
}