import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import './SingleResult.sass';
import { Panel, PanelHeader, Counter, Group, Cell, PanelHeaderBack, FormItem, Button, Alert, Div, Progress, Text, FormLayout, Radio, Checkbox, FixedLayout, Input, List, Footer } from '@vkontakte/vkui';

import { HtmlKatex } from './../TaskElements';

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

  React.useEffect(() => {
    if (props.tasksCount == 0) return;
    console.log(props);

    let results = props.tasks.map((v, i) => ({
      id: v.id,
      duration: props.durations[i],
      answer: props.answers[i],
      result: props.results[i]
    }));

    app.Network.sendResults(props.subject_id, results.slice(0, props.tasksCount));
  }, []);

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
        <FormItem>
          <Checkbox checked={ state.resultsFilter[0] } onChange={ (ev) => onFilter(0, ev.target.checked) }>Неправильные ответы</Checkbox>
          <Checkbox checked={ state.resultsFilter[1] } onChange={ (ev) => onFilter(1, ev.target.checked) }>Правильные ответы</Checkbox>
        </FormItem>
      </FormLayout>
      { tasks.map(v => (
        <div key={v} className="task_container">
          <Div>
            <div style={{
              padding: '15px 10px',
              border: '2px solid black',
              borderTopWidth: 0,
              borderLeftWidth: 0,
              background: props.results[v] ? "#a5d6a7" : "#ef9a9a"
            }}>
              <Text weight="medium">
                <HtmlKatex text={`${props.tasks[v].id}. ` + props.tasks[v].question} />
              </Text>
            </div>
            
            { props.tasks[v].picture &&
              <Div style={{ display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
                <T_Image src={`/static/pictures/${props.subject_id}/${props.tasks[v].picture}`} />
              </Div>
            }

            { props.tasks[v].type == "order" &&
              <T_Order  problem={ props.tasks[v] } result={ props.results[v] } answer={ props.answers[v].split('').map(v => parseInt(v)) } />
            }
            { props.tasks[v].type == "input" &&
              <T_Input  problem={ props.tasks[v] } result={ props.results[v] } answer={ props.answers[v] } />
            }
            { props.tasks[v].type == "radio" &&
              <T_Radio  problem={ props.tasks[v] } result={ props.results[v] } answer={ parseInt(props.answers[v]) } />
            }
            { props.tasks[v].type == "select" &&
              <T_Select problem={ props.tasks[v] } result={ props.results[v] } answer={ props.answers[v].split('').map(v => parseInt(v)) } />
            }
          </Div>
        </div>
      ))}
    </Panel>
  );
}

function T_Image(props) {
  const [dimensions, setDimensions] = React.useState({ w: 1, h: 1 });

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const mxw = document.body.clientWidth * 0.7;
      const mxh = document.body.clientHeight * 0.35;
      var nd = { w: img.width, h: img.height };
      if (nd.w > mxw) {
        nd.h = mxw * nd.h / nd.w;
        nd.w = mxw;
      }
      if (nd.h > mxh) {
        nd.w = mxh * nd.w / nd.h;
        nd.h = mxh;
      }
      setDimensions(nd);
    };
    img.src = props.src;
  }, [props.src]);

  return (
    <img src={ props.src } width={ dimensions.w } height={ dimensions.h } />
  )
}

function T_Order({ problem, answer, result }) {

  return (
    <FormLayout>
      <FormItem>
        <List>
          { answer.map((v, i) => (
            <Cell key={v}
            className="order-cell"
            before={
              <Counter mode={ problem.answer.indexOf(v.toString()) == i ? "primary" : "prominent" } style={{ marginRight: 10 }}>{ problem.answer.indexOf(v.toString()) + 1 }</Counter>
            }
            >
              <HtmlKatex text={v} />
            </Cell>
          ))}
        </List>
      </FormItem>
    </FormLayout>
  );
}

function T_Input({ problem, answer, result }) {

  return (
  <>
    <FormLayout>
      <FormItem>
        <Input defaultValue={ answer } disabled={true} className="input-c"
        />
      </FormItem>
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
      <FormItem>
        { problem.options.map((v, i) => (
          <Radio name="test" key={ i } checked={ answer == i }
            onChange={ forceUpdate }
            style={{ background: problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}
          ><HtmlKatex text={v} /></Radio>
        ))
        }
      </FormItem>
    </FormLayout>
  );
}

function T_Select({ problem, answer, result }) {
  const [_, forceUpdate] = React.useReducer(x => x + 1, 1);
  console.log(answer);
  return (
    <FormLayout>
      <FormItem>
      { problem.options.map((v, i) => (
          <Checkbox key={ i } checked={ answer.indexOf(i) != -1 }
            onChange={ forceUpdate }
            style={{ background: problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}>
              <HtmlKatex text={v} />
          </Checkbox>
        ))
        }
      </FormItem>
    </FormLayout>
  );
}