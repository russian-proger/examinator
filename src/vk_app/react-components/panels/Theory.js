import React from 'react';
import { EngineProvider } from '../../engine/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, CellButton } from '@vkontakte/vkui';


export default function Theory(props) {
  const app = React.useContext(EngineProvider);

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>Теория</PanelHeader>
      <Group header={ <Header mode="secondary">Дисциплина</Header> }>
        <Cell expandable onClick={ () => app.Event.dispatchEvent("openpanel", ["v-theory", { type: 'prog'} ]) }>Основы программирования</Cell>
        <Cell expandable onClick={ () => app.Event.dispatchEvent("openpanel", ["v-theory", { type: 'geom'} ]) }>Начертательная геометрия</Cell>
        <Cell expandable onClick={ () => app.Event.dispatchEvent("openpanel", ["v-theory", { type: 'math'} ]) }>Математический анализ</Cell>
      </Group>
    </Panel>
  );
}