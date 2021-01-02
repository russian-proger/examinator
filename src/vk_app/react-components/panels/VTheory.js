import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, CellButton, Div, Text, Headline } from '@vkontakte/vkui';

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
            <Problem key={p_index} problem={ problem } />
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
    <Group style={{ background: "#f5f5f5" }}>
      <Div>
        <Headline>Вопрос: { props.problem.question }</Headline>
      </Div>
      { props.problem.type == "text" &&
        <Div>
          <Text>Ответ: { props.problem.solution }</Text>
        </Div>
      }
      { props.problem.type == "code" &&
        <Code code={ props.problem.solution } />
      }
    </Group>
  )
}