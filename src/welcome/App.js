import React from 'react';
import { CoreProvider } from '../vk_app/core/AppEngine';

import bridge from '@vkontakte/vk-bridge';
import { AppRoot, View, Panel, PanelHeader, FixedLayout, Button, PanelHeaderBack, Group, Cell, Header, List, Avatar, Snackbar } from '@vkontakte/vkui';
import { Icon24Copy, Icon16Done } from '@vkontakte/icons';

var count = 0;
export default function App(_props) {
  // Таким образом получаем ядро приложения во всех компонентах
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    snackbar: null,
    paid: false
  });

  // Запуск Particles.js на заднем фоне
  React.useLayoutEffect(() => {
    window.particlesJS('particles', {
      "particles": {
        "number": {
          "value": 45,
          "density": {
            "enable": true,
            "value_area": 800
          }
        },
        "color": {
          "value": "#2787F5"
        },
        "shape": {
          "type": "circle",
          "stroke": {
            "width": 0,
            "color": "#000000"
          },
          "polygon": {
            "nb_sides": 5
          },
          "image": {
            "src": "img/github.svg",
            "width": 100,
            "height": 100
          }
        },
        "opacity": {
          "value": 0.9,
          "random": false,
          "anim": {
            "enable": false,
            "speed": 1,
            "opacity_min": 0.1,
            "sync": false
          }
        },
        "size": {
          "value": 6,
          "minValue": 4,
          "random": true,
          "anim": {
            "enable": false,
            "speed": 80,
            "size_min": 15,
            "sync": false
          }
        },
        "line_linked": {
          "enable": true,
          "distance": 150,
          "color": "#2787F5",
          "opacity": 0.4,
          "width": 2
        },
        "move": {
          "enable": true,
          "speed": 1.5,
          "direction": "none",
          "random": false,
          "straight": false,
          "out_mode": "out",
          "bounce": false,
          "attract": {
            "enable": false,
            "rotateX": 600,
            "rotateY": 1200
          }
        }
      },
      "interactivity": {
        "detect_on": "canvas",
        "events": {
          "onhover": {
            "enable": false,
            "mode": "repulse"
          },
          "onclick": {
            "enable": false,
            "mode": "push"
          },
          "resize": false
        },
        "modes": {
          "grab": {
            "distance": 800,
            "line_linked": {
              "opacity": 1
            }
          },
          "bubble": {
            "distance": 800,
            "size": 80,
            "duration": 2,
            "opacity": 8,
            "speed": 3
          },
          "repulse": {
            "distance": 400,
            "duration": 0.4
          },
          "push": {
            "particles_nb": 4
          },
          "remove": {
            "particles_nb": 2
          }
        }
      },
      "retina_detect": true
    })
  }, []);

  function copyText() {
    let text = `${API_KEY}#${UID}`;
    let textElement = document.createElement('input');
    textElement.type = "text";
    document.body.appendChild(textElement);
    textElement.value = text;
    textElement.select();
    document.execCommand("copy");
    textElement.remove();

    setState({
      snackbar: (
        <Snackbar
          duration="1500"
          onClose={() => setState({ snackbar: null })}
          before={<Avatar size={24} style={{ background: 'var(--accent)' }}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
        >
          ID скопировано
        </Snackbar>
      )
    });
  }

  function pay() {
    bridge.send("VKWebAppOpenPayForm", {
      app_id: 7711817,
      action: "pay-to-group",
      params: {
        description: "Оплата доступа",
        amount: 3,
        group_id: 204746349
      }
    }).then(ev => {
      if (ev.status) {
        app.Network.isPaid().then(v => console.log(v));
        setState({ paid: true });
      }
    });
  }

  return (
    <AppRoot>
      <View id="main" activePanel={ "main" }>
        <Panel id="main">
          <PanelHeader>Экзаменатор</PanelHeader>
          
          <FixedLayout vertical="top">
            <div key="particles" id="particles"/>
          </FixedLayout>
          
          <div className="header">
            <h1>Помогаем подготовиться к экзаменам</h1>
          </div>
          
          { state.paid &&
            <div className="success-pay-button">
              <h3>Оплата проведена успешно!</h3>
            </div>
          }

          { !state.paid &&
            <div className="pay-button" onClick={ pay }>
              <h3>Получить доступ</h3>
            </div>
          }

          { state.snackbar }
        </Panel>
      </View>
    </AppRoot>
  );
}
