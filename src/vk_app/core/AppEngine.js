import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import Event from './Event';
import FileSystem from './FileSystem';
import StringSystem from './String';
import Network from './Network';

export function AppCore() {
  this.init = function init() {
    // Сообщаем ВК, что приложение готово к работе
    bridge.supports("VKWebAppInit") && bridge.send("VKWebAppInit");
    bridge.supports("VKWebAppSetViewSettings") && bridge.send("VKWebAppSetViewSettings", {"status_bar_style": "dark", "action_bar_color": "#fff"});
    setInterval(() => this.Network.online(), 60 * 1000);
  };

  // Событийный элемент
  this.Event = new Event(this);

  // Система загрузки и кэширования файлов
  this.File = new FileSystem(this);

  // Дополнительные возможности для работы со строками
  this.String = new StringSystem(this);

  // Объект для взаимодействия с сервером
  this.Network = new Network(this);
}

export const CoreProvider = React.createContext(new AppCore());