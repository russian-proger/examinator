import bridge from '@vkontakte/vk-bridge';

import "./index.sass";

bridge.send("VKWebAppInit");

var fetching = false;
document.getElementById("reload").onclick = () => {
  if (fetching) return ;

  fetching = true;
  
  fetch(`https://${window.location.hostname}/is-stable`).then(r => {
    if (r.status == 200) {
      window.open(window.location.href.replace(/\:\d+/, ''), '_self');
    }
    fetching = false;
  })
}