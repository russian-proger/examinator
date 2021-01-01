// Фреймворк React.js
import React from 'react';
import ReactDOM from 'react-dom';

// Библиотеки VK Bridge & VKUI
import '@vkontakte/vkui/dist/vkui.css';

// Интерфейс приложения
import AppInterface from './react-components/AppInterface';

// Движок приложения
import { AppEngine, EngineProvider } from './engine/AppEngine';

// Экземпляр класса-одиночки
const app = new AppEngine();

// Рендеринг интерфейса
ReactDOM.render((
  <EngineProvider.Provider value={app}>
    <AppInterface />
  </EngineProvider.Provider>
), document.getElementById("root"));

// Запуск приложения
app.init();