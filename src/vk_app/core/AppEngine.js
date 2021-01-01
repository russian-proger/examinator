import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import Event from './Event';

export function AppCore() {
  this.init = function init() {
    bridge.send("VKWebAppInit");
  };

  this.Event = new Event();
}

export const CoreProvider = React.createContext(new AppCore());