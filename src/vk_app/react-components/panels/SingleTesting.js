import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import './SingleTesting.sass';

import {
  SSRWrapper,
  Panel,
  PanelHeader,
  Counter,
  Group,
  Cell,
  PanelHeaderButton,
  Button,
  Alert,
  Div,
  Progress,
  Text,
  FormLayout,
  Radio,
  Checkbox,
  FixedLayout,
  FormItem,
  Input,
  List,
  Footer,
  ANDROID,
  ScreenSpinner
} from '@vkontakte/vkui';

import Icon28DoorArrowLeftOutline from '@vkontakte/icons/dist/28/door_arrow_left_outline';

import Icon28CancelCircleFillRed from '@vkontakte/icons/dist/28/cancel_circle_fill_red';
import Icon28CheckCircleFill from '@vkontakte/icons/dist/28/check_circle_fill';
import "./../../../../node_modules/katex/dist/katex.min.css";

import { copyObj } from './../../core/Utils';
import { HtmlKatex } from './../TaskElements';

export default function SingleTesting(props) {
  const app = React.useContext(CoreProvider);
  const [state, setState] = React.useState({
    tasks: null,
    tasksCount: 0,
    currentTask: 0,
    replied: false,
    answers: [],
    results: [],
    durations: [],
    enterTime: Date.now() 
  });

  React.useEffect(() => {
    app.Event.dispatchEvent("openpopout", [<ScreenSpinner />]);
    
    let now = Date.now();

    let tasksCount = props.allTasks ? props.tasks.catalog.length : props.tasksCount;

    let tasks = Object.create(props.tasks.catalog).map(v => copyObj(v))
    if (props.tasks.separated)
      tasks = tasks.filter(v => props.categories[v.category]);


    let max = Math.max(...props.freqs);

    tasks = tasks.sort((lhs, rhs) => Math.random() - 0.5).sort((lhs, rhs) => {
      let l = props.skills[parseInt(lhs.id)];
      let r = props.skills[parseInt(rhs.id)];

      if (max != 0) {
        l *= (props.freqs[parseInt(lhs.id)]) / max;
        r *= (props.freqs[parseInt(rhs.id)]) / max;
      }

      l *= Math.random() / 10 + 1;
      r *= Math.random() / 10 + 1;

      return l - r;
    }).slice(0, tasksCount);
    tasksCount = tasks.length;

    // IN DEV MODE
    // let offset = 0;
    // tasks = Object.create(props.tasks.catalog).map(v => copyObj(v)).filter(v => parseInt(v.id) >= offset).slice(0, tasksCount);

    const close = () => {
      app.Event.dispatchEvent("closepopout");
      setState({ ...state, tasks, tasksCount });
    }

    const _now = Date.now();
    if (now > _now - 1000)
      setTimeout(close, now - (_now - 1000));
    else
      close();
  }, []);

  React.useLayoutEffect(() => {
    if (state.replied) {
      const handler = ({ key }) => {
        if (key == "Enter") {
          next();
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [state.replied]);

  function complete() {
    app.Event.dispatchEvent('switchpanel', ["single-result", { ...state, tasksCount: state.results.length, subject_id: props.subject_id, durations: state.durations }]);
  }

  function openExit() {
    const popout = (
      <Alert
        actions={[{
          title: 'Посмотреть результаты',
          autoclose: true,
          mode: 'default',
          action: () => complete(),
        }, {
          title: 'Завершить и выйти',
          autoclose: true,
          mode: 'destructive',
          action: () => app.Event.dispatchEvent("closepanel"),
        }, {
          title: 'Отмена',
          autoclose: true,
          mode: 'cancel'
        }]}
        actionsLayout="vertical"
        onClose={ () => app.Event.dispatchEvent("closepopout") }
      >
        <h2>Завершение теста</h2>
        <p>Вы уверены, что хотите завершить тест?</p>
      </Alert>
    )

    app.Event.dispatchEvent("openpopout", [popout]);
  }

  function onReply(answer, result) {
    setState({ ...state,
      replied: true,
      answers: [...state.answers, answer],
      results: [...state.results, result],
      durations: [...state.durations, Date.now() - state.enterTime] });
  }

  function next() {
    if (state.currentTask + 1 == state.tasksCount) {
      complete();
    } else {
      setState({ ...state, currentTask: state.currentTask + 1, replied: false, enterTime: Date.now() });
    }
  }

  const tasksLeft = state.tasksCount - state.currentTask - state.replied;

  return (
    // No comments...
    <Panel id={ props.id } className="single-testing-panel">
      <PanelHeader left={
        <PanelHeaderButton onClick={ openExit }><Icon28DoorArrowLeftOutline/></PanelHeaderButton>
      }>{ state.tasks != null ? `Вопрос ${ state.currentTask + 1 }` : "Тестирование" }</PanelHeader>

      { state.tasks != null &&
      <>
        <FixedLayout vertical="top" style={{ borderBottom: '1px solid #f2f2f3' }}>
          <Div style={{ background: 'white' }}>
            <Progress value={ (state.currentTask + state.replied) / state.tasksCount * 100 } />
          </Div>
        </FixedLayout>
        <div style={{ height: 25 }} />

        <Div>
          <div style={{
            padding: '15px 10px',
            border: '2px solid #a9d5f9',
            borderTopWidth: 0,
            borderLeftWidth: 0,
            background: '#c6e2f9'
          }}>
            <Text weight="medium">
              <HtmlKatex text={`${(state.tasks[state.currentTask].id)}. ` + state.tasks[state.currentTask].question} />
            </Text>
          </div>
        </Div>

        { state.tasks[state.currentTask].picture &&
          <Div style={{ display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
            <T_Image src={`/static/pictures/${props.subject_id}/${state.tasks[state.currentTask].picture}`} />
          </Div>
        }

        { (state.tasks && state.tasks[state.currentTask].type == "order") &&
          <T_Order key={ state.currentTask } id={ state.tasks[state.currentTask].id } problem={ state.tasks[state.currentTask] } onReply={ onReply } replied={ state.replied } />
        }
        { (state.tasks && state.tasks[state.currentTask].type == "input") &&
          <T_Input key={ state.currentTask } id={ state.tasks[state.currentTask].id } problem={ state.tasks[state.currentTask] } onReply={ onReply } replied={ state.replied } />
        }
        { (state.tasks && state.tasks[state.currentTask].type == "radio") &&
          <T_Radio key={ state.currentTask } id={ state.tasks[state.currentTask].id } problem={ state.tasks[state.currentTask] } onReply={ onReply } replied={ state.replied } />
        }
        { (state.tasks && state.tasks[state.currentTask].type == "select") &&
          <T_Select key={ state.currentTask } id={ state.tasks[state.currentTask].id } problem={ state.tasks[state.currentTask] } onReply={ onReply } replied={ state.replied } />
        }
        { state.replied && 
          <FixedLayout vertical="bottom">
            <Div style={{ background: 'white' }}>
              <Button mode={ state.currentTask + 1 == state.tasksCount ? "commerce" : "primary" } stretched size="l" onClick={ next }>
                { state.currentTask + 1 == state.tasksCount ? "Узнать результаты" : "Дальше" }
              </Button>
            </Div>
          </FixedLayout>
        }

        { state.tasksCount - state.currentTask - state.replied > 0 && 
          <Footer>Остал{ tasksLeft == 1 ? 'ся' : 'ось' } { tasksLeft } вопрос{tasksLeft == 1 ? '' : (tasksLeft >= 2 && tasksLeft <= 4 ? 'а' : 'ов')}</Footer>
        }
        { state.tasksCount - state.currentTask - state.replied == 0 && 
          <Footer>Вы ответили на все вопросы :)</Footer>
        }
        <div style={{ display: 'block', height: 100 }}></div>
      </>
      }

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

function T_Order({ problem, id, onReply, replied }) {
  const [answer, setAnswer] = React.useState(new Array(problem.options.length).fill(0).map((v, i) => i).sort(() => Math.random() - 0.5));
  function reply() {
    onReply(answer.join(''), answer.join('') == problem.answer);
  }

  React.useLayoutEffect(() => {
    const handler = ({ key }) => {
      if (key == "Enter" && answer != "") {
        reply();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer]);

  return (
  <>
    <FormLayout>
      <FormItem top="Укажите верный порядок">
        <List>
          <SSRWrapper userAgent="android">
            { answer.map((v, i) => (
              <Cell platform={ ANDROID } key={v} draggable={ !replied }
              className={["order-cell", replied ? "order-status" : ""].join(' ')}
              onDragFinish={({ from, to }) => {
                const draggingList = answer.slice();
                draggingList.splice(from, 1);
                draggingList.splice(to, 0, answer[from]);
                setAnswer(draggingList);
              }}
              before={ replied ?
                <Counter mode={ problem.answer.indexOf(v.toString()) == i ? "primary" : "prominent" } style={{ marginRight: 10 }}>{ problem.answer.indexOf(v.toString()) + 1 }</Counter>
                : null
              }
              >
                <HtmlKatex text={problem.options[v]} />
              </Cell>
            ))}
          </SSRWrapper >
        </List>
      </FormItem>
    </FormLayout>

    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
            <Button mode="primary" stretched size="l" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}

function T_Input({ problem, id, onReply, replied }) {
  const [answer, setAnswer] = React.useState(null);

  function reply() {
    onReply(answer, problem.answer.indexOf(answer) != -1);
  }

  React.useLayoutEffect(() => {
    const handler = ({ key }) => {
      if (key == "Enter" && answer != "") {
        reply();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer]);

  return (
  <>
    <FormLayout>
      <FormItem top="Введите правильный ответ">
        <Input onChange={ (ev) => !replied && setAnswer(ev.target.value.trim()) } className={ replied ? (problem.answer.indexOf(answer) != -1 ? 'correct' : 'incorrect') : '' }
          style={{ background: replied ? (problem.answer.indexOf(answer) != -1 ? "#a5d6a7" : "#ef9a9a") : "transparent", border: `${ replied ? 1 : 0 }px solid #e3e4e6`, borderRadius: 9 }}
        />
      </FormItem>
    </FormLayout>

    {replied &&
      <Div>
        <Text weight="medium">Правильный ответ: ({ problem.answer.join('|') })</Text>
      </Div>
    }

    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
            <Button mode="primary" stretched size="l" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}

function T_Radio({ problem, id, onReply, replied }) {
  const [conv] = React.useState(new Array(problem.options.length).fill(0).map((v, i) => i).sort(() => Math.random() - 0.5));
  const [answer, setAnswer] = React.useState(null);

  function reply() {
    if (answer == null) return;
    onReply(answer.toString(), answer.toString() == problem.answer);
  }

  React.useLayoutEffect(() => {
    const handler = ({ key }) => {
      if (key == "Enter" && answer != null) {
        reply();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer]);

  return (
  <>
    <FormLayout>
      <FormItem top="Выберите один правильный ответ">
        { problem.options.map((v, _i) => {
          const i = conv[_i];
          return (
            <Radio name="test" key={ i } checked={ answer == i }
              onChange={ (ev) => ev.target.checked && setAnswer(replied ? answer : i) }
              style={{ background: replied && (problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : (answer == i ? "#ef9a9a" : "transparent")) }}
            ><HtmlKatex text={problem.options[i]} /></Radio>
          );
        })
        }
      </FormItem>
    </FormLayout>

    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
          <Button disabled={ answer == null } mode="primary" stretched size="l" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}

function T_Select({ problem, id, onReply, replied }) {
  const [conv] = React.useState(new Array(problem.options.length).fill(0).map((v, i) => i).sort(() => Math.random() - 0.5));
  const [answer, setAnswer] = React.useState(new Array(problem.options.length).fill(false));

  function reply() {
    var res = answer.map((v, i) => i).filter((v, i) => answer[i]).join('');
    onReply(res, res == problem.answer);
  }

  React.useLayoutEffect(() => {
    const handler = ({ key }) => {
      if (key == "Enter" && answer.some(v => v)) {
        reply();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer]);

  return (
  <>
    <FormLayout>
      <FormItem top="Выберите несколько правильных ответов">
      { problem.options.map((v, _i) => {
          const i = conv[_i];
          return (
            <Checkbox key={ i } checked={ answer[i] }
              onChange={ (ev) => setAnswer([...answer.slice(0, i), replied ? answer[i] : ev.target.checked, ...answer.slice(i + 1)]) }
              style={{ background: replied && problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}>
                <HtmlKatex text={problem.options[i]} />
            </Checkbox>
          )
        })
        }
      </FormItem>
    </FormLayout>
    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
          <Button disabled={ answer.every(v => !v) } mode="primary" stretched size="l" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}