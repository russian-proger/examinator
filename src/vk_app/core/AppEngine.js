import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import Event from './Event';
import FileSystem from './FileSystem';
import StringSystem from './String';
import Interface from './Interface';

export function AppCore() {
  this.init = function init() {
    // Сообщаем ВК, что приложение готово к работе
    bridge.send("VKWebAppInit");
    bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "dark", "action_bar_color": "#fff"});
  };

  // Событийный элемент
  this.Event = new Event(this);

  // Система загрузки и кэширования файлов
  this.File = new FileSystem(this);

  // Дополнительные возможности для работы со строками
  this.String = new StringSystem(this);

  // Упрощение работы интерфейса
  this.Interface = new Interface(this);
}

export const CoreProvider = React.createContext(new AppCore());