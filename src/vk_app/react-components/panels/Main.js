import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { FixedLayout, Tabs, TabsItem, Separator, Button, Div, Panel, PanelHeader } from '@vkontakte/vkui';

/** 
 * @param {Object} props
 * @param {CallableFunction} props.openPanel
 */
export default function Main(props) {
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    activeTab: 'groups',
  });

  return (
    <Panel id={ props.id }>
      <PanelHeader>Экзаменатор</PanelHeader>

      { state.activeTab == 'groups' &&
        <Div>
          asd
        </Div>
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