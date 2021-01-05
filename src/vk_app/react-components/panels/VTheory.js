import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, CellButton, Div, Text, Headline, Button, Separator } from '@vkontakte/vkui';

import Code from '../others/Code';

/**
 * @param {Object} props
 * @param {string} props.type
 */
export default function VTheory(props) {
  const app = React.useContext(CoreProvider);
  const [materials, setMaterials] = React.useState(null);

  React.useLayoutEffect(() => {
    app.File.loadFromURL(`/assets/${props.subject}.json`, true).then(mat => {
      setMaterials(mat);
    });
  }, []);

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>
        { materials == null ?  "Загрузка..." : materials.subject_name }
      </PanelHeader>
      { materials && materials.catalog.map((catalog, c_index) => (
        <Div key={c_index}>
          <Header mode="primary">{ catalog.title }</Header>
          { catalog.problems.map((problem, p_index) => (
            <Problem key={p_index} index={ p_index } problem={ problem } />
          ))}
        </Div>
      ))
      }
    </Panel>
  )
}

function Problem(props) {
  const [expanded, setExpanded] = React.useState(false);
  return (
    <Group style={{ background: "#f5fafd", borderRight: '2px solid #dbf0f1', borderBottom: '2px solid #dbf0f1' }} separator="hide">
      <Div>
        <Text weight="medium">Вопрос №{ props.index + 1 }: <span dangerouslySetInnerHTML={{ __html: props.problem.question }} /></Text>
      </Div>
      { props.problem.type == "text" &&
        <Div>
          {expanded ?
            <Button size="l" mode="secondary" onClick={ () => setExpanded(false) }>Скрыть ответ</Button>
            : <Button size="l" mode="primary" onClick={ () => setExpanded(true) }>Показать ответ</Button>}
          {expanded &&
            <div style={{ marginTop: 15 }} dangerouslySetInnerHTML={{ __html: props.problem.answer }}></div>
          }
        </Div>
      }
      { props.problem.type == "code" &&
        <Div>
          { expanded ?
            <><Button style={{ marginBottom: 15 }} size="l" mode="secondary" onClick={ () => setExpanded(false) }>Скрыть решение</Button><Code code={ props.problem.answer } /></>
            : <Button size="l" mode="primary" onClick={ () => setExpanded(true) }>Показать решение</Button>}
        </Div>
      }
      { props.problem.type == "input" &&
        <Div>
          <Text weight="medium">Ответ: <span dangerouslySetInnerHTML={{ __html: '(' + props.problem.answer.join('|') + ')' }} /></Text>
        </Div>
      }
      { (props.problem.type == "radio" || props.problem.type == "select") &&
        <Div>
          { props.problem.options.map((v, i) => (
            <div style={{ backgroundColor: props.problem.answer.indexOf(i.toString()) != -1 ? "#a5d6a7" : "transparent", borderTop: '1px solid #505050' }} key={ i }>
              <span dangerouslySetInnerHTML={{ __html: v }} />
            </div>
          ))}
        </Div>
      }
      { props.problem.type == "order" &&
        <Div>
          { props.problem.answer.split('').map((v, i) => (
            <div key={ i }>
              <span dangerouslySetInnerHTML={{ __html: `${i + 1}: ` + props.problem.options[parseInt(v)] }} />
            </div>
          ))}
          <Text style={{ marginTop: 10, borderTop: '2px solid rgb(219 240 241)' }} weight="semibold" color="gray">*В этом задании нужно расположить элементы в правильном порядке</Text>
        </Div>
      }
    </Group>
  )
}