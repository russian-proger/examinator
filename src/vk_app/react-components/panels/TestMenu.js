import React from 'react';
import { AppCore, CoreProvider } from '../../core/AppEngine';

import {
  Button,
  Cell,
  Checkbox,
  Div,
  Group,
  Header,
  List,
  FixedLayout,
  Footer,
  FormItem,
  FormLayout,
  FormLayoutGroup,
  FormStatus,
  Panel,
  PanelHeader,
  PanelHeaderBack,
  PanelSpinner,
  Radio,
  Slider,
  Text
} from '@vkontakte/vkui';

const subject_names = ["ЭВМ", "Интегралы", "Теория Информации"];

import { subjects } from './../../../../assets/robots';

export default function TestMenu(props) {
  /** @type {AppCore} */
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    subject: 'geom',
    tasksCount: 15,
    allTasks: false,
    random: false,
    fetching: true
  });

  React.useEffect(() => {
    let url = `/assets/${ subjects[props.subject_id] }.json`;
    
    Promise.all([
      app.File.loadFromURL(url, false, true, false),
      app.Network.getSkills(props.subject_id)
    ]).then( ([tests, skills]) => {
      console.log(tests, skills);
    })
    
  }, []);

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>{ subject_names[props.subject_id] }</PanelHeader>

      {state.fetching ? <PanelSpinner /> : null}

      <FormLayout>
        <FormLayoutGroup top={`Экзаменационная дисциплина`}>
          <FormItem top="Количество вопросов">
            { [15, 25, 35, 50].map((v, i) => (
              <Radio key={v} name="count" value={v} defaultChecked={ !i } onClick={ () => setState({...state, tasksCount: v, allTasks: false}) }>{v}</Radio>
            ))
            }
            <Radio name="count" value={100} onClick={() => setState({...state, allTasks: true})}>Все вопросы</Radio>
          </FormItem>
        </FormLayoutGroup>
      </FormLayout>

      <div style={{ height: 70 }} />

      <FixedLayout vertical="bottom">
        <Div>
          <Button mode="primary" stretched size="l" disabled={ !state.allTasks && state.tasksCount < 5 } onClick={() => app.Event.dispatchEvent('switchpanel', ["single-testing", { ...state }])}>Начать!</Button>
        </Div>
      </FixedLayout>
    </Panel>
  )
}