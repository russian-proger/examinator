import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, Button, FormLayout, FormLayoutGroup, Radio, FixedLayout, Footer, Div, Slider, Checkbox, Text, FormStatus } from '@vkontakte/vkui';


export default function TestMenu(props) {
  const app = React.useContext(CoreProvider);
  const [state, setState] = React.useState({
    subject: 'geom',
    tasksCount: 10,
    allTasks: false,
    random: true,
    types: {
      order: true,
      input: true,
      radio: true,
      select: true
    }
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
            <Checkbox onChange={ v => setState({ ...state, allTasks: v.target.checked, random: true }) } checked={ state.allTasks }>Ответить на все вопросы</Checkbox>
            { state.allTasks &&
              <Checkbox onChange={ v => setState({ ...state, random: !v.target.checked }) } checked={ !state.random }>По порядку</Checkbox>
            }
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
        <FormLayoutGroup top="Типы заданий">
          <Checkbox onChange={ v => setState({ ...state, types: { ...state.types, radio: v.target.checked } }) } checked={ state.types.radio }>
            Один вариант ответа
          </Checkbox>
          <Checkbox onChange={ v => setState({ ...state, types: { ...state.types, select: v.target.checked } }) } checked={ state.types.select }>
            Несколько вариантов ответа
          </Checkbox>
          <Checkbox onChange={ v => setState({ ...state, types: { ...state.types, input: v.target.checked } }) } checked={ state.types.input }>
            Ввод
          </Checkbox>
          <Checkbox onChange={ v => setState({ ...state, types: { ...state.types, order: v.target.checked } }) } checked={ state.types.order }>
            Последовательность
          </Checkbox>
        </FormLayoutGroup>
      </FormLayout>

      <FormLayout>
        <FormLayoutGroup top={`Экзаменационная дисциплина`}>
          <Radio name="subject" value="geom" defaultChecked>Начертательная геометрия</Radio>
        </FormLayoutGroup>
      </FormLayout>

      <div style={{ height: 70 }} />

      <FixedLayout vertical="bottom">
        <Div>
          <Button mode="primary" stretched size="xl" disabled={ !state.allTasks && state.tasksCount < 5 } onClick={() => app.Event.dispatchEvent('switchpanel', ["single-testing", { ...state }])}>Начать!</Button>
        </Div>
      </FixedLayout>
    </Panel>
  )
}