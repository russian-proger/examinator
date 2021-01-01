import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import Event from './Event';

export function AppEngine() {
  this.init = function init() {
    bridge.send("VKWebAppInit");
  };

  this.Event = new Event();
}

export const EngineProvider = React.createContext(new AppEngine());