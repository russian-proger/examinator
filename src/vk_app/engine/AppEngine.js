import React from 'react';

export function AppEngine() {
  this.init = function init() {
    console.log("init");
  };


}

export const EngineProvider = React.createContext(new AppEngine());