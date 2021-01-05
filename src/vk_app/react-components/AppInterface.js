import React from 'react';
import { CoreProvider } from '../core/AppEngine';

import bridge from '@vkontakte/vk-bridge';
import { Root, View, Panel, PanelHeader, PanelHeaderBack, Group, Cell, Header, List } from '@vkontakte/vkui';

// Панели
import Main from './panels/Main';
import Schedule from './panels/Schedule';
import Theory from './panels/Theory';
import VTheory from './panels/VTheory';
import TestMenu from './panels/TestMenu';
import SingleTesting from './panels/SingleTesting';
import SingleResult from './panels/SingleResult';

var count = 0;
export default function AppInterface(_props) {
  // Таким образом получаем ядро приложения во всех компонентах
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    activePanel: "main", // Текущая панель
    activeProps: {},     // Свойства, передаваемые этому панелю
    activeView: "main",  // Текущее окно
    history: ["main"],   // История панелей для iosSwipeBack
    props: {},         // История свойств
    popout: null         // Для модальных окон
  });

  // Функция закрытия панели
  function closePanel() {
    console.assert(state.history.length >= 2, "Function closePanel: history isn't enough in size to make closing panel");
    // Отключаем iosSwipeBack, если у нас осуществляется переход на корневую панель
    if (state.history.length == 2) {
      bridge.send("VKWebAppDisableSwipeBack");
    }
    setState({ ...state, activePanel: state.history[state.history.length - 2], history: state.history.slice(0, -1)});
  }

  // Функция открытия панели
  function openPanel(activePanel, activeProps={}) {
    // Если у нас открыта одна единственная панель, то iosSwipeBack не включён или был отключён
    if (state.history.length == 1) {
      bridge.send("VKWebAppEnableSwipeBack");
    }
    setState({ ...state, activePanel, props: { ...state.props, [activePanel]: activeProps }, history: state.history.concat(activePanel) });
  }

  // Функция замены панели
  function switchPanel(activePanel, activeProps={}) {
    // Если у нас открыта одна единственная панель, то iosSwipeBack не включён или был отключён
    setState({ ...state, activePanel, props: { ...state.props, [activePanel]: activeProps }, history: state.history.slice(0, -1).concat(activePanel) });
  }

  // Открытие модального окна
  function openPopout(popout) {
    setState({ ...state, popout });
  }

  // Закрытие модального окна
  function closePopout() {
    setState({ ...state, popout: null });
  }

  React.useLayoutEffect(() => {
    app.Event.addEventListener("closepopout", closePopout);
    app.Event.addEventListener("openpopout", openPopout);
    return () => {
      app.Event.removeEventListener("closepopout", closePopout);
      app.Event.removeEventListener("openpopout", openPopout);
    }
  }, [state.activePanel, state.popout]);

  // Добавляем слушатели к событиям
  React.useLayoutEffect(() => {
    app.Event.addEventListener("openpanel" , openPanel);
    app.Event.addEventListener("closepanel", closePanel);
    app.Event.addEventListener("switchpanel", switchPanel);
    return () => {
      app.Event.removeEventListener("openpanel",  openPanel);
      app.Event.removeEventListener("closepanel", closePanel);
      app.Event.removeEventListener("switchpanel", switchPanel);
    }
  }, [state]);

  return (
    <View id="main" activePanel={ state.activePanel } history={ state.history } onSwipeBack={ closePanel } popout={ state.popout }>
      <Main          id="main"           {...(state.props['main']          ?? {})} />
      <Schedule      id="schedule"       {...(state.props['schedule']      ?? {})} />
      <Theory        id="theory"         {...(state.props['theory']        ?? {})} />
      <VTheory       id="v-theory"       {...(state.props['v-theory']       ?? {})} />
      <TestMenu      id="test-menu"      {...(state.props['test-menu']      ?? {})} />
      <SingleTesting id="single-testing" {...(state.props['single-testing'] ?? {})} />
      <SingleResult  id="single-result"  {...(state.props['single-result']  ?? {})} />
    </View>
  );
}