import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import './SingleResult.sass';
import { Panel, PanelHeader, Counter, Group, Cell, PanelHeaderBack, Button, Alert, Div, Progress, Text, FormLayout, FormLayoutGroup, Radio, Checkbox, FixedLayout, Input, List, Footer } from '@vkontakte/vkui';


export default function TestMenu(props) {
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    resultsFilter: [true, true]
  });

  const score = React.useMemo(() => {
    var result = 0;
    props.results.forEach(v => result += v);
    return result;
  }, [props.results]);

  if (props.tasksCount == 0) {
    return (
      <Panel id={ props.id }>
        <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>Результаты</PanelHeader>
        <Div>
          <h3>Вы не ответили ни на один вопрос :(</h3>
        </Div>
      </Panel>
    )
  }

  function onFilter(index, val) {
    var resultsFilter = state.resultsFilter.slice();
    resultsFilter[index] = val;
    setState({ ...state, resultsFilter });
  }

  const tasks = new Array(props.tasksCount).fill(0).map((v, i) => i).filter(v => state.resultsFilter[props.results[v] ? 1 : 0]);

  return (
    <Panel id={ props.id } className="single-result-panel">
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>Результаты</PanelHeader>
      <Div>
        <h3>Результат: { parseInt(score) } из { props.tasksCount } ({ (score / props.tasksCount * 100).toFixed(1) }%)</h3>
      </Div>
      <FormLayout>
        <FormLayoutGroup>
          <Checkbox checked={ state.resultsFilter[0] } onChange={ (ev) => onFilter(0, ev.target.checked) }>Неправильные ответы</Checkbox>
          <Checkbox checked={ state.resultsFilter[1] } onChange={ (ev) => onFilter(1, ev.target.checked) }>Правильные ответы</Checkbox>
        </FormLayoutGroup>
      </FormLayout>
      { tasks.map(v => (
        <div key={v} className="task_container">
          <Div>
            <div style={{
              padding: '15px 10px',
              border: '2px solid #a9d5f9',
              borderTopWidth: 0,
              borderLeftWidth: 0,
              background: '#c6e2f9'
            }}>
              <Text weight="medium">
                <span dangerouslySetInnerHTML={{ __html: `${(props.tasks[v][1] + 1).toString()}. ` + props.tasks[v][0].question }}></span>
              </Text>
            </div>
            
            { props.tasks[v][0].picture &&
              <Div style={{ display: 'flex', justifyContent: 'center' }}>
                <img src={ `/static/images/${props.subject}/${props.tasks[v][0].picture}` } style={{ maxWidth: "50vw" }} />
              </Div>
            }

            { props.tasks[v][0].type == "order" &&
              <T_Order  problem={ props.tasks[v][0] } result={ props.results[v] } answer={ props.answers[v].split('').map(v => parseInt(v)) } />
            }
            { props.tasks[v][0].type == "input" &&
              <T_Input  problem={ props.tasks[v][0] } result={ props.results[v] } answer={ props.answers[v] } />
            }
            { props.tasks[v][0].type == "radio" &&
              <T_Radio  problem={ props.tasks[v][0] } result={ props.results[v] } answer={ parseInt(props.answers[v]) } />
            }
            { props.tasks[v][0].type == "select" &&
              <T_Select problem={ props.tasks[v][0] } result={ props.results[v] } answer={ props.answers[v].split('').map(v => parseInt(v)) } />
            }
          </Div>
        </div>
      ))}
    </Panel>
  );
}


function T_Order({ problem, answer, result }) {

  return (
    <FormLayout>
      <FormLayoutGroup>
        <List>
          { answer.map((v, i) => (
            <Cell key={v}
            className="order-cell"
            indicator={
              <Counter mode={ problem.answer.indexOf(v.toString()) == i ? "primary" : "prominent" } style={{ marginRight: 10 }}>{ problem.answer.indexOf(v.toString()) + 1 }</Counter>
            }
            >
              <span dangerouslySetInnerHTML={{ __html: problem.options[v] }}></span>
            </Cell>
          ))}
        </List>
      </FormLayoutGroup>
    </FormLayout>
  );
}

function T_Input({ problem, answer, result }) {

  return (
  <>
    <FormLayout>
      <FormLayoutGroup>
        <Input defaultValue={ answer }
          style={{ background: problem.answer.indexOf(answer) != -1 ? "#a5d6a7" : "#ef9a9a", border: `1px solid #e3e4e6`, borderRadius: 9 }}
        />
      </FormLayoutGroup>
    </FormLayout>

    
    <Div>
      <Text weight="medium">Правильный ответ: ({ problem.answer.join('|') })</Text>
    </Div>
  </>
  );
}

function T_Radio({ problem, answer, result }) {
  const [_, forceUpdate] = React.useReducer(x => x + 1, 1);
  return (
    <FormLayout>
      <FormLayoutGroup>
        { problem.options.map((v, i) => (
          <Radio name="test" key={ i } checked={ answer == i }
            onChange={ forceUpdate }
            style={{ background: problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}
          ><span dangerouslySetInnerHTML={{ __html: v }}></span></Radio>
        ))
        }
      </FormLayoutGroup>
    </FormLayout>
  );
}

function T_Select({ problem, answer, result }) {
  const [_, forceUpdate] = React.useReducer(x => x + 1, 1);

  return (
    <FormLayout>
      <FormLayoutGroup>
      { problem.options.map((v, i) => (
          <Checkbox key={ i } checked={ answer.indexOf(i) != -1 }
            onChange={ forceUpdate }
            style={{ background: problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}>
              <span dangerouslySetInnerHTML={{ __html: v }}></span>
          </Checkbox>
        ))
        }
      </FormLayoutGroup>
    </FormLayout>
  );
}