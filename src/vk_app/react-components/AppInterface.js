import React from 'react';
import { CoreProvider } from '../core/AppEngine';

import bridge from '@vkontakte/vk-bridge';
import { Root, View, Panel, PanelHeader, PanelHeaderBack, Group, Cell, Header, List } from '@vkontakte/vkui';

// Панели
import Main from './panels/Main';
import Schedule from './panels/Schedule';
import Theory from './panels/Theory';
import VTheory from './panels/VTheory';


export default function AppInterface(_props) {
  // Таким образом получаем ядро приложения во всех компонентах
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    activePanel: "main", // Текущая панель
    activeProps: {},     // Свойства, передаваемые этому панелю
    activeView: "main",  // Текущее окно
    history: ["main"],   // История панелей для iosSwipeBack
    props: [{}]          // История свойств
  });

  // Функция закрытия панели
  function closePanel() {
    console.assert(state.history.length >= 2, "Function closePanel: history isn't enough in size to make closing panel");
    // Отключаем iosSwipeBack, если у нас осуществляется переход на корневую панель
    if (state.history.length == 2) {
      bridge.send("VKWebAppDisableSwipeBack");
    }
    setState({ ...state, activePanel: state.history[state.history.length - 2], activeProps: state.props[state.props.length - 2], history: state.history.slice(0, -1), props: state.props.slice(0, -1) });
  }

  // Функция открытия панели
  function openPanel(activePanel, activeProps={}) {
    // Если у нас открыта одна единственная панель, то iosSwipeBack не включён или был отключён
    if (state.history.length == 1) {
      bridge.send("VKWebAppEnableSwipeBack");
    }
    setState({ ...state, activePanel, activeProps, history: state.history.concat(activePanel), props: state.props.concat(activeProps) });
  }

  // Добавляем слушатели к событиям
  React.useLayoutEffect(() => {
    app.Event.addEventListener("openpanel" , openPanel);
    app.Event.addEventListener("closepanel", closePanel);
    return () => {
      app.Event.removeEventListener("openpanel",  openPanel);
      app.Event.removeEventListener("closepanel", closePanel);
    }
  }, [state]);

  return (
    <Root activeView={ state.activeView }>
      <View id="main" activePanel={ state.activePanel } history={ history } onSwipeBack={ closePanel }>
        <Main       id="main"     {...state.activeProps} />
        <Schedule   id="schedule" {...state.activeProps} />
        <Theory     id="theory"   {...state.activeProps} />
        <VTheory    id="v-theory" {...state.activeProps} />
      </View>
    </Root>
  );
}