import React from 'react';
import bridge from "@vkontakte/vk-bridge";

import Event from './Event';
import FileSystem from './FileSystem';
import StringSystem from './String';

export function AppCore() {
  this.init = function init() {
    // Сообщаем ВК, что приложение готово к работе
    bridge.send("VKWebAppInit");
  };

  // Событийный элемент
  this.Event = new Event();

  // Система загрузки и кэширования файлов
  this.File = new FileSystem();

  // Дополнительные возможности для работы со строками
  this.String = new StringSystem();
}

export const CoreProvider = React.createContext(new AppCore());