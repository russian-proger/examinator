import React from 'react';
import { AppCore, CoreProvider } from '../../core/AppEngine';

import { FixedLayout, Tabs, TabsItem, Separator, Button, Div, Panel, PanelHeader, Header, CellButton, Group, PanelHeaderButton } from '@vkontakte/vkui';
import { Icon28RefreshOutline } from '@vkontakte/icons';

import "./Main.sass";

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
        <div className="groups-tab">
          <div className="first-row flex-row">
            <SubjectButton onClick={ openTest(0) } subject_id={ 0 } date="04.06.2021" descr="ЭВМ"/>
            <SubjectButton onClick={ openTest(1) } subject_id={ 1 } date="08.06.2021" descr="Интегралы"/>
          </div>
          <div className="second-row flex-center">
            <SubjectButton onClick={ openTest(2) } subject_id={ 2 } date="15.06.2021" descr="Теория информации"/>
          </div>
        </div>
      }

      { state.activeTab == 'events' &&
        <div className="events-tab">
          <h2 style={{textAlign: 'center'}}>Здесь будут ваши последние решённые тесты...</h2>
        </div>
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

function SubjectButton({ subject_id, onClick, descr, date }) {
  return (
    <div className="subject-button">
      <div onClick={ onClick } className={`btn-icon icon-${subject_id}`}>

      </div>
      <div className="descr">
        <span>{ descr }</span>
      </div>
      <div className="date">
        <span>{ date }</span>
      </div>
    </div>
  );
}