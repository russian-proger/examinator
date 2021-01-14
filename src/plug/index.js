import bridge from '@vkontakte/vk-bridge';

import "./index.sass";

bridge.send("VKWebAppInit");

document.getElementById("reload").onclick = () => {
  window.location.reload();
}