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
  PanelHeaderButton,
  PanelSpinner,
  Radio,
  Slider,
  Text
} from '@vkontakte/vkui';

const subject_names = ["ЭВМ", "Интегралы", "Теория Информации"];

import { Icon28BookOutline } from '@vkontakte/icons';

import { subjects } from './../../../../assets/robots';

export default function TestMenu(props) {
  /** @type {AppCore} */
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    tasksCount: 15,
    allTasks: false,
    fetching: true
  });

  React.useEffect(() => {
    let url = `/assets/${ subjects[props.subject_id] }.json`;
    
    Promise.all([
      app.File.loadFromURL(url, true, true, false),
      app.Network.getSkills(props.subject_id)
    ]).then( ([tasks, skills]) => {
      setState({ ...state, tasks, skills: skills.result, fetching: false });
    })
  }, []);

  function openTheory() {
    console.log("open theory");
    app.Event.dispatchEvent("openpanel", ["theory", { materials: state.tasks, subject_id: props.subject_id }])
  }

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <>
        <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } />
        <PanelHeaderButton onClick={ openTheory }><Icon28BookOutline /></PanelHeaderButton>
      </>}>{ subject_names[props.subject_id] }</PanelHeader>

      {state.fetching ? <PanelSpinner /> : null}

      <FormLayout>
        <FormLayoutGroup top={`Экзаменационная дисциплина`}>
          <FormItem top="Количество вопросов">
            { [15, 25, 35, 50].map((v, i) => (
              <Radio key={v} name="count" value={v} defaultChecked={ !i } onClick={ () => setState({...state, tasksCount: v, allTasks: false}) }>{v}</Radio>
            ))
            }
            <Radio name="count" value={0} onClick={() => setState({...state, allTasks: true})}>Все вопросы { state.tasks ? `(${state.tasks.catalog.length})` : `` }</Radio>
          </FormItem>
        </FormLayoutGroup>
      </FormLayout>

      <div style={{ height: 70 }} />

      <FixedLayout vertical="bottom">
        <Div>
          <Button mode="primary" stretched size="l" disabled={ !state.allTasks && state.tasksCount < 5 } onClick={() => !state.fetching &&  app.Event.dispatchEvent('switchpanel', ["testing", { ...state, subject_id: props.subject_id }])}>Начать!</Button>
        </Div>
      </FixedLayout>
    </Panel>
  )
}