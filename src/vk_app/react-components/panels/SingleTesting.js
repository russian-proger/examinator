import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import './SingleTesting.sass';

import { Panel, PanelHeader, Counter, Group, Cell, PanelHeaderButton, Button, Alert, Div, Progress, Text, FormLayout, FormLayoutGroup, Radio, Checkbox, FixedLayout, Input, List, Footer } from '@vkontakte/vkui';
import Icon28DoorArrowLeftOutline from '@vkontakte/icons/dist/28/door_arrow_left_outline';

import Icon28CancelCircleFillRed from '@vkontakte/icons/dist/28/cancel_circle_fill_red';
import Icon28CheckCircleFill from '@vkontakte/icons/dist/28/check_circle_fill';

export default function SingleTesting(props) {
  const app = React.useContext(CoreProvider);
  const [state, setState] = React.useState({
    tasks: null,
    tasksCount: 0,
    currentTask: 0,
    replied: false,
    answers: [],
    results: []
  });

  React.useEffect(() => {
    app.File.loadFromURL(`/assets/${ props.subject }.json`, true).then(mat => {
      var tasks = mat.catalog[0].problems.map((v, i) => [v, i]).sort(() => Math.random() - 0.9).sort(() => Math.random() - 0.1).sort(() => Math.random() - 0.5);
      if (!props.allTasks) {
        tasks = tasks.slice(0, props.tasksCount);
      }

      setState({ ...state, tasks, tasksCount: tasks.length });
    });
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
    app.Event.dispatchEvent('switchpanel', ["single-result", { ...state, tasksCount: state.results.length, subject: props.subject }]);
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
    setState({ ...state, replied: true, answers: [...state.answers, answer], results: [...state.results, result] });
  }

  function next() {
    if (state.currentTask + 1 == state.tasksCount) {
      complete();
    } else {
      setState({ ...state, currentTask: state.currentTask + 1, replied: false });
    }
  }

  const tasksLeft = state.tasksCount - state.currentTask - state.replied;

  return (
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
              <span dangerouslySetInnerHTML={{ __html: `${(state.tasks[state.currentTask][1] + 1).toString()}. ` + state.tasks[state.currentTask][0].question }}></span>
            </Text>
          </div>
        </Div>

        { state.tasks[state.currentTask][0].picture &&
          <Div style={{ display: 'flex', justifyContent: 'center' }}>
            <img src={ `/static/images/${props.subject}/${state.tasks[state.currentTask][0].picture}` } style={{ maxWidth: "50vw" }} />
          </Div>
        }

        { (state.tasks && state.tasks[state.currentTask][0].type == "order") &&
          <T_Order key={ state.currentTask } id={ state.tasks[state.currentTask][1] } problem={ state.tasks[state.currentTask][0] } onReply={ onReply } replied={ state.replied } />
        }
        { (state.tasks && state.tasks[state.currentTask][0].type == "input") &&
          <T_Input key={ state.currentTask } id={ state.tasks[state.currentTask][1] } problem={ state.tasks[state.currentTask][0] } onReply={ onReply } replied={ state.replied } />
        }
        { (state.tasks && state.tasks[state.currentTask][0].type == "radio") &&
          <T_Radio key={ state.currentTask } id={ state.tasks[state.currentTask][1] } problem={ state.tasks[state.currentTask][0] } onReply={ onReply } replied={ state.replied } />
        }
        { (state.tasks && state.tasks[state.currentTask][0].type == "select") &&
          <T_Select key={ state.currentTask } id={ state.tasks[state.currentTask][1] } problem={ state.tasks[state.currentTask][0] } onReply={ onReply } replied={ state.replied } />
        }
        { state.replied && 
          <FixedLayout vertical="bottom">
            <Div style={{ background: 'white' }}>
              <Button mode={ state.currentTask + 1 == state.tasksCount ? "commerce" : "primary" } stretched size="xl" onClick={ next }>
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
      <FormLayoutGroup top="Укажите верный порядок">
        <List>
          { answer.map((v, i) => (
            <Cell key={v} draggable={ !replied }
            className="order-cell"
            onDragFinish={({ from, to }) => {
              const draggingList = answer.slice();
              draggingList.splice(from, 1);
              draggingList.splice(to, 0, answer[from]);
              setAnswer(draggingList);
            }}
            indicator={ replied ?
              <Counter mode={ problem.answer.indexOf(v.toString()) == i ? "primary" : "prominent" } style={{ marginRight: 10 }}>{ problem.answer.indexOf(v.toString()) + 1 }</Counter>
              : null
            }
            >
              <span dangerouslySetInnerHTML={{ __html: problem.options[v] }}></span>
            </Cell>
          ))}
        </List>
      </FormLayoutGroup>
    </FormLayout>

    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
            <Button mode="primary" stretched size="xl" onClick={ reply }>Ответить</Button>
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
      <FormLayoutGroup top="Введите правильный ответ">
        <Input onChange={ (ev) => !replied && setAnswer(ev.target.value) }
          style={{ background: replied ? (problem.answer.indexOf(answer) != -1 ? "#a5d6a7" : "#ef9a9a") : "transparent", border: `${ replied ? 1 : 0 }px solid #e3e4e6`, borderRadius: 9 }}
        />
      </FormLayoutGroup>
    </FormLayout>

    {replied &&
      <Div>
        <Text weight="medium">Правильный ответ: ({ problem.answer.join('|') })</Text>
      </Div>
    }

    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
            <Button mode="primary" stretched size="xl" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}

function T_Radio({ problem, id, onReply, replied }) {
  const [answer, setAnswer] = React.useState(null);

  function reply() {
    if (answer == null) return;
    onReply(answer.toString(), answer.toString() == problem.answer);
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
      <FormLayoutGroup top="Выберите один правильный ответ">
        { problem.options.map((v, i) => (
          <Radio name="test" key={ i } checked={ answer == i }
            onChange={ (ev) => ev.target.checked && setAnswer(replied ? answer : i) }
            style={{ background: replied && problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}
          ><span dangerouslySetInnerHTML={{ __html: v }}></span></Radio>
        ))
        }
      </FormLayoutGroup>
    </FormLayout>

    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
          <Button disabled={ answer == null } mode="primary" stretched size="xl" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}

function T_Select({ problem, id, onReply, replied }) {
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
      <FormLayoutGroup top="Выберите несколько правильных ответов">
      { problem.options.map((v, i) => (
          <Checkbox key={ i } checked={ answer[i] }
            onChange={ (ev) => setAnswer([...answer.slice(0, i), replied ? answer[i] : ev.target.checked, ...answer.slice(i + 1)]) }
            style={{ background: replied && problem.answer.indexOf(i.toString()) != -1 ? "#c8e6c9" : "transparent" }}>
              <span dangerouslySetInnerHTML={{ __html: v }}></span>
          </Checkbox>
        ))
        }
      </FormLayoutGroup>
    </FormLayout>
    {!replied && 
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
          <Button disabled={ answer.every(v => !v) } mode="primary" stretched size="xl" onClick={ reply }>Ответить</Button>
        </Div>
      </FixedLayout>
    }
  </>
  );
}