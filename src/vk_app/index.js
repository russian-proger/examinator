// Фреймворк React.js
import React from 'react';
import ReactDOM from 'react-dom';

// Библиотеки VK Bridge & VKUI
import '@vkontakte/vkui/dist/vkui.css';
import bridge from '@vkontakte/vk-bridge';

// Интерфейс приложения
import AppInterface from './react-components/AppInterface';

// Движок приложения
import { AppEngine, EngineProvider } from './engine/AppEngine';

const app = new AppEngine();

ReactDOM.render((
  <EngineProvider.Provider value={app}>
    <AppInterface />
  </EngineProvider.Provider>
), document.getElementById("root"));