import React from 'react';
import { AppCore, CoreProvider } from '../../core/AppEngine';

import { FixedLayout, Tabs, TabsItem, Separator, Button, Div, Panel, PanelHeader, Header, CellButton, Group, PanelHeaderButton } from '@vkontakte/vkui';
import { Icon28RefreshOutline } from '@vkontakte/icons';
/** 
 * @param {Object} props
 * @param {CallableFunction} props.openPanel
 */
export default function Main(props) {
  /** @type {AppCore} */
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    activeTab: 'groups',
  });

  // Возвращает кол-бэк для открытия панели с тестом
  function openTest(subject_id) {
    return () => {
      app.Event.dispatchEvent("openpanel", ["test-menu", { subject_id }]);
    }
  }

  return (
    <Panel id={ props.id }>
      <PanelHeader
        left={ <PanelHeaderButton onClick={ () => window.location.reload() }><Icon28RefreshOutline /></PanelHeaderButton> }
      >Экзаменатор</PanelHeader>

      { state.activeTab == 'groups' &&
        <Group header={ <Header mode="secondary">Выберите предмет</Header> }>
          <CellButton onClick={ openTest(0) } expandable={true}>ЭВМ</CellButton>
          <CellButton onClick={ openTest(1) } expandable={true}>Интегралы</CellButton>
          <CellButton onClick={ openTest(2) } expandable={true}>Теория информации</CellButton>
        </Group>
      }

      <FixedLayout filled vertical="bottom">
        <Separator wide />
        <Tabs>
          <TabsItem
            selected={state.activeTab === 'groups'}
            onClick={() => setState({ activeTab: 'groups' })}
          >Тесты</TabsItem>

          <TabsItem
            selected={state.activeTab === 'events'}
            onClick={() => setState({ activeTab: 'events' })}
          >Статистика</TabsItem>
        </Tabs>
      </FixedLayout>
    </Panel>
  );
}