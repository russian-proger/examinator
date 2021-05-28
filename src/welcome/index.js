import React from 'react';
import ReactDOM from 'react-dom';
import bridge from '@vkontakte/vk-bridge';

import '@vkontakte/vkui/dist/vkui.css';
import './styles.sass';
import "./particles";

import { AppCore, CoreProvider } from '../vk_app/core/AppEngine';

import App from './App.js';

const app = new AppCore();

app.init();

// Обновление экрана (для разработки)
window.addEventListener("keydown", (ev) => {
  if (ev.key == "F2") {
    window.location.reload();
  }
})

ReactDOM.render((
  <CoreProvider.Provider value={app}>
    <App />
  </CoreProvider.Provider>
), document.getElementById("root"));