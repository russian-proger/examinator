// Фреймворк React.js
import React from 'react';
import ReactDOM from 'react-dom';

// Библиотеки VK Bridge & VKUI
import '@vkontakte/vkui/dist/vkui.css';

// Интерфейс приложения
import AppInterface from './react-components/AppInterface';

// Движок приложения
import { AppCore, CoreProvider } from './core/AppEngine';

// Экземпляр класса-одиночки
const app = new AppCore();

window.app = app;

// Рендеринг интерфейса
ReactDOM.render((
  <CoreProvider.Provider value={app}>
    <AppInterface />
  </CoreProvider.Provider>
), document.getElementById("root"));

// Запуск приложения
app.init();

// Обновление экрана (для разработки)
window.addEventListener("keydown", (ev) => {
  if (ev.key == "F2") {
    window.location.reload();
  }
})