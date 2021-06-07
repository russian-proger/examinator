import React from 'react';
import { AppCore, CoreProvider } from '../../core/AppEngine';

import "./TestMenu.sass";

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

  const catTasksCount = React.useMemo(() => {
    if (!state.categories || !state.tasks || !state.tasks.separated) return 0;
    let result = 0;
    for (let i = 0; i < state.counts.length; ++i) {
      if (state.categories[i]) {
        result += state.counts[i];
      }
    }
    return result
  }, [state.categories])

  React.useEffect(() => {
    let url = `/assets/${ subjects[props.subject_id] }.json`;
    
    Promise.all([
      app.File.loadFromURL(url, true, true, false),
      app.Network.getSkills(props.subject_id)
    ]).then( ([tasks, skills]) => {
      let counts     = [];
      let categories = [];

      if (tasks.separated) {
        counts     = tasks.categories.map(v => 0);
        categories = tasks.categories.map(v => true);
        for (let v of tasks.catalog) {
          counts[v.category]++;
        }
      }
      setState({ ...state, categories, counts, tasks, skills: skills.result, fetching: false });
    })
  }, []);

  function openTheory() {
    app.Event.dispatchEvent("openpanel", ["theory", { categories: state.categories, materials: state.tasks, subject_id: props.subject_id }])
  }

  let slider_max = null;
  if (state.tasks) {
    slider_max = state.tasks.separated ? catTasksCount : state.tasks.catalog.length;
  }

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <>
        <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } />
        <PanelHeaderButton onClick={ openTheory }><Icon28BookOutline /></PanelHeaderButton>
      </>}>{ subject_names[props.subject_id] }</PanelHeader>

      {state.fetching ? <PanelSpinner /> : null}

      <FormLayout>
        <FormLayoutGroup>
          { state.tasks && 
            <FormItem>
              <Radio name="type" value={true} onClick={() => setState({...state, allTasks: true})}>Ответить на все вопросы</Radio>
              <Radio name="type" value={false} defaultChecked={ true } onClick={ () => setState({...state, allTasks: false}) }>Выбрать индивидуально</Radio>
            </FormItem>
          }
          { state.tasks && !state.allTasks &&
            <FormItem top={`Количество вопросов. Выбрано: ${state.tasksCount}`}>
              <Slider min={0} max={slider_max || 0.5} step={slider_max > 30 ? 5 : 1} value={state.tasksCount} onChange={ (v) => setState({...state, tasksCount: Math.min(v, slider_max)}) }/>
            </FormItem>
          }
          { state.tasks && state.tasks.separated &&
            <FormItem top={
              <div className="part-top-wrapper">
                <span>Разделы. Доступно: {catTasksCount}</span>
                { state.categories.every(v => v) ?
                  (<Button className="extra-button" mode="tertiary" onClick={() => setState({...state, categories: state.categories.map(v => false), tasksCount: 0})}>Отменить все</Button>)
                : (<Button className="extra-button" mode="tertiary" onClick={() => setState({...state, categories: state.categories.map(v => true)})}>Выбрать все</Button>)
                }
              </div>
            }>
              {state.tasks.categories.map((v, i) => (
                <Checkbox key={i} checked={state.categories[i]} onChange={(ev) => setState({...state,
                  tasksCount: Math.min(state.tasksCount, catTasksCount + (ev.target.checked ? state.counts[i] : -state.counts[i])),
                  categories: [...state.categories.slice(0, i), ev.target.checked, ...state.categories.slice(i + 1)]
                })}>{v} ({state.counts[i]})</Checkbox>
              ))}
            </FormItem>
          }
        </FormLayoutGroup>
      </FormLayout>

      <div style={{ height: 70 }} />

      { state.tasks &&
        <FixedLayout vertical="bottom">
          <Div style={{background: '#ffffffaa'}}>
            <Button mode="primary" stretched size="l" disabled={ state.tasks.separated ? (!state.allTasks && state.tasksCount < 5) || (state.allTasks && catTasksCount < 5) : (!state.allTasks && state.tasksCount < 5) } onClick={() => !state.fetching &&  app.Event.dispatchEvent('switchpanel', ["testing", { ...state, subject_id: props.subject_id }])}>Начать!</Button>
          </Div>
        </FixedLayout>
      }
    </Panel>
  )
}