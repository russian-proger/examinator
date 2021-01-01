import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack } from '@vkontakte/vkui';

export default function Schedule(props) {
  const app = React.useContext(CoreProvider);

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>Расписание</PanelHeader>
      <Group mode="plain" header={<Header mode="secondary">12 ИВТ</Header>}>
        <List>
          <Cell description="30.12.2020&nbsp;  12:00-15:00">
            Информатика
          </Cell>
          <Cell description="11.01.2021&nbsp;  12:00-15:00">
            Основы программирования
          </Cell>
          <Cell description="14.01.2021&nbsp;  12:00-15:00">
            Начертательная геометрия
          </Cell>
          <Cell description="18.01.2021&nbsp;  12:00-15:00">
            Математический анализ
          </Cell>
        </List>
      </Group>
      <Group mode="plain" header={<Header mode="secondary">11 ИВТ</Header>}>
        <Cell description="30.12.2020&nbsp;  09:00-12:00">
          Информатика
        </Cell>
        <Cell description="11.01.2021&nbsp;  09:00-12:00">
          Основы программирования
        </Cell>
        <Cell description="14.01.2021&nbsp;  09:00-12:00">
          Начертательная геометрия
        </Cell>
        <Cell description="18.01.2021&nbsp;  09:00-12:00">
          Математический анализ
        </Cell>
      </Group>
    </Panel>
  );
}