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
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>{ props.subject }</PanelHeader>
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
        <Text weight="medium">Вопрос №{ props.index + 1 }: { props.problem.question }</Text>
      </Div>
      { props.problem.type == "text" &&
        <Div>
          <Text>Ответ: { props.problem.solution }</Text>
        </Div>
      }
      { props.problem.type == "code" &&
        <Div>
          { expanded ?
            <><Text weight="medium">Решение:</Text><Code code={ props.problem.solution } /><Button size="l" mode="secondary" onClick={ () => setExpanded(false) }>Скрыть решение</Button></>
            : <Div style={{ display: 'flex', justifyContent: 'center' }}><Button size="l" mode="primary" onClick={ () => setExpanded(true) }>Показать решение</Button></Div>}
        </Div>
      }
    </Group>
  )
}