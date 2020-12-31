import React from 'react';

import { Root, View } from '@vkontakte/vkui';

import Schedule from './panels/Schedule';

import { EngineProvider } from '../engine/AppEngine';

export default function AppInterface(_props) {
  const app = React.useContext(EngineProvider);
  const [state, useState] = React.useState({ activeView: "main", activePanel: "schedule" });
  
  React.useLayoutEffect(() => {
    app.init();
  }, []);

  return (
    <Root activeView={ state.activeView }>
      <View id="main" activePanel={ state.activePanel }>
        <Schedule id="schedule" />
      </View>
    </Root>
  )
}