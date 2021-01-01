import React from 'react';
import { EngineProvider } from '../../engine/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, CellButton } from '@vkontakte/vkui';

/**
 * @param {Object} props
 * @param {string} props.type
 */
export default function VTheory(props) {
  const app = React.useContext(EngineProvider);

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>{ props.type }</PanelHeader>
      
    </Panel>
  )
}