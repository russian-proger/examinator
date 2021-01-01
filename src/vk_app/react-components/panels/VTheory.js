import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, Cell, Header, List, PanelHeaderBack, CellButton } from '@vkontakte/vkui';

/**
 * @param {Object} props
 * @param {string} props.type
 */
export default function VTheory(props) {
  const app = React.useContext(CoreProvider);

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>{ props.type }</PanelHeader>
      
    </Panel>
  )
}