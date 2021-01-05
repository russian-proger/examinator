import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Button, Div, Panel, PanelHeader } from '@vkontakte/vkui';

/** 
 * @param {Object} props
 * @param {CallableFunction} props.openPanel
 */
export default function Main(props) {
  const app = React.useContext(CoreProvider);

  return (
    <Panel id={ props.id }>
      <PanelHeader>Экзаменатор</PanelHeader>
      <Div>
        <Button stretched size="xl" onClick={ () => app.Event.dispatchEvent("openpanel", ["test-menu"]) }>Пройти тест</Button>
      </Div>
      <Div>
        <Button stretched size="xl" onClick={ () => app.Event.dispatchEvent("openpanel", ["schedule"]) }>Расписание экзаменов</Button>
      </Div>
      <Div>
        <Button stretched size="xl" onClick={ () => app.Event.dispatchEvent("openpanel", ["theory"]) }>Теоретические материалы</Button>
      </Div>
    </Panel>
  );
}