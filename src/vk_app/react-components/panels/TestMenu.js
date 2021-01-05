import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, Button, FormLayout, FormLayoutGroup, Radio, FixedLayout, Footer, Div, Slider, Checkbox, Text, FormStatus } from '@vkontakte/vkui';


export default function TestMenu(props) {
  const app = React.useContext(CoreProvider);
  const [state, setState] = React.useState({
    subject: 'geom',
    tasksCount: 10,
    allTasks: false
  });

  function setTasksCount(tasksCount) {
    setState({ ...state, tasksCount });
  }

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>Тест</PanelHeader>
      
      <FormLayout>
        <FormLayoutGroup top={`Количество вопросов: ${ state.allTasks ? "все" : state.tasksCount }`}>
          <Div>
            <Checkbox onChange={ v => setState({ ...state, allTasks: v.target.checked }) } value={ state.allTasks }>Ответить на все вопросы</Checkbox>
          </Div>
          { !state.allTasks &&
            <Slider onChange={ v => setTasksCount(v) } defaultValue={ state.tasksCount } max={ 50 } step={ 5 } />
          }
        </FormLayoutGroup>
      </FormLayout>

      { !state.allTasks && state.tasksCount < 5 &&
        <Div>
          <FormStatus header="Некорректное число вопросов" mode="error">Количество вопросов должно быть не менее 5</FormStatus>
        </Div>
      }

      <FormLayout>
        <FormLayoutGroup top={`Экзаменационная дисциплина`}>
          <Radio name="subject" value="geom" defaultChecked>Начертательная геометрия</Radio>
          <Radio name="subject" value="math" description="Недоступно" disabled>Математический анализ</Radio>
        </FormLayoutGroup>
      </FormLayout>

      <FixedLayout vertical="bottom">
        <Div>
          <Button mode="primary" stretched size="xl" disabled={ !state.allTasks && state.tasksCount < 5 } onClick={() => app.Event.dispatchEvent('switchpanel', ["single-testing", { ...state }])}>Начать!</Button>
        </Div>
      </FixedLayout>
    </Panel>
  )
}