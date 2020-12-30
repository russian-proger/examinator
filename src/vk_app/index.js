import '@vkontakte/vkui/dist/vkui.css';

import React from 'react';
import ReactDOM from 'react-dom';
import bridge from '@vkontakte/vk-bridge';

import { Root, View, Panel, PanelHeader, Group, Cell, PanelHeaderBack, Button, Div, Card, CardGrid, Header, List, Footer } from '@vkontakte/vkui';
import Icon28UserOutline from '@vkontakte/icons/dist/28/user_outline';
import Icon28UsersOutline from '@vkontakte/icons/dist/28/users_outline';
import Icon28BookOutline from '@vkontakte/icons/dist/28/book_outline';
import Icon28RecentOutline from '@vkontakte/icons/dist/28/recent_outline';

// Panels
import SingleTest from './single_test';
import Schedule from './schedule';

// Other
import { loadTests, tests } from './tests_loader';

function App() {
  /** @type { [{activePanel: string}] } */
  const [state, setState] = React.useState({ activePanel: "home" });

  return (
  <Root activeView="view">
    <View id="view" activePanel={ state.activePanel }>

      {/* Основное меню */}
      <Panel id="home">
        <PanelHeader>Экзаменатор</PanelHeader>
        <Group>
            <Div>
              <Button mode="primary" stretched size="xl" before={<Icon28UserOutline/>} onClick={() => setState({ activePanel: "single-test" })}>Пробный экзамен</Button>
            </Div>
            <Div>
              <Button mode="secondary" stretched size="xl" before={<Icon28RecentOutline/>} onClick={() => setState({ activePanel: "schedule" })}>Расписание экзаменов</Button>
            </Div>
            <Div>
              <Button mode="destructive" stretched size="xl" before={<Icon28UsersOutline/>} onClick={() => setState({ activePanel: "multiplayer" })}>Тренировка</Button>
            </Div>
            <Div>
              <Button mode="destructive" stretched size="xl" before={<Icon28BookOutline/>} onClick={() => setState({ activePanel: "theory" })}>Теория</Button>
            </Div>
          </Group>
      </Panel>

      {/* Меню одиночной сдачи экзамена */}
      <Panel id="single-test">
        <PanelHeader left={ <PanelHeaderBack onClick={ () => setState({ activePanel: "home" }) } /> }>Пробник</PanelHeader>
        <SingleTest />
      </Panel>
      
      {/* Меню мультиплеерного экзмаена */}
      <Panel id="multiplayer">
        <PanelHeader left={ <PanelHeaderBack onClick={ () => setState({ activePanel: "home" }) } /> }>Тренировка</PanelHeader>
        <Footer>Здесь скучно...</Footer>
      </Panel>

      {/* Теоретические материалы */}
      <Panel id="theory">
        <PanelHeader left={ <PanelHeaderBack onClick={ () => setState({ activePanel: "home" }) } /> }>Теория</PanelHeader>
        <Footer>Тут пока пусто...</Footer>
      </Panel>

      {/* Расписание экзаменов */}
      <Panel id="schedule">
        <PanelHeader left={ <PanelHeaderBack onClick={ () => setState({ activePanel: "home" }) } /> }>Расписание</PanelHeader>
        <Schedule />
      </Panel>
    </View>
  </Root>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
bridge.send('VKWebAppInit');
bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "dark", "action_bar_color": "#fff"});
loadTests();