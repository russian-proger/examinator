import React from 'react';
import { CoreProvider } from '../vk_app/core/AppEngine';

import bridge from '@vkontakte/vk-bridge';
import { IconButton, AppRoot, View, Panel, PanelHeader, FixedLayout, Button, PanelHeaderBack, Group, Cell, Header, List, Avatar, Snackbar, ScreenSpinner, PanelHeaderButton } from '@vkontakte/vkui';
import { Icon28RefreshOutline } from '@vkontakte/icons';

import { Icon24Copy, Icon16Done, Icon16Cancel } from '@vkontakte/icons';
import { Icon24ArrowRightOutline } from '@vkontakte/icons';
import { Icon20CheckCircleFillGreen } from '@vkontakte/icons';
var count = 0;
export default function App(_props) {
  // Таким образом получаем ядро приложения во всех компонентах
  const app = React.useContext(CoreProvider);

  const [state, setState] = React.useState({
    snackbar: null,
    paidStatus: 0,
    interval: null,
    disabled: false
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
    });
  }, []);

  function pay() {
    setState({ ...state, disabled: true });
    app.Network.isPaid().then(res => {
      console.log(res);
      setState({ ...state, disabled: false });
      if (res.status && res.result) {
        window.location.reload();
      } else {
        var handle = (ev => {
          console.log(ev);
          var countTries = 0;
          var interval = setInterval(() => {
            app.Network.isPaid().then(v => {
              if (countTries++ > 120) {
                clearInterval(interval);
                setState({ paidStatus: 0 });
              }
    
              if (v.status && v.result) {
                clearInterval(interval);
                setState({ paidStatus: 2, snackbar: (
                  <Snackbar
                    duration="3500"
                    onClose={() => setState({ ...state, paidStatus: 2, snackbar: null })}
                    before={<Avatar size={24} ><Icon20CheckCircleFillGreen /></Avatar>}
                  >Оплата прошла успешно</Snackbar>
                ) });
              }
            });
          }, 2000);
          setState({ paidStatus: 1, interval });
        });

        bridge.send("VKWebAppOpenPayForm", {
          app_id: 7711817,
          action: "pay-to-group",
          params: {
            description: "Оплата доступа",
            amount: MONEY / 1000,
            group_id: 204746349
          }
        }).catch(ev => {
          if (ev.error_data.error_code != 1) {
            handle(ev)
          }
        }).then(handle);
      }
    });
  }

  function cancelChecking() {
    clearInterval(state.interval);
    setState({
      interval: null,
      paidStatus: 0
    });
  }

  return (
    <AppRoot>
      <View id="main" activePanel={ "main" } popout={ state.paidStatus == 1 ? <><ScreenSpinner/><IconButton className="cancel-checking-icon-button" onClick={ cancelChecking }><Icon16Cancel /></IconButton></> : null }>
        <Panel id="main">
          <PanelHeader
            left={ <PanelHeaderButton onClick={ () => window.location.reload() }><Icon28RefreshOutline /></PanelHeaderButton> }
          >Экзаменатор</PanelHeader>
          
          <FixedLayout className="particles-layout" vertical="top">
            <div key="particles" id="particles"/>
          </FixedLayout>
          
          <div className="header">
            <h1>Помогаем подготовиться к экзаменам</h1>
          </div>
          


          { state.paidStatus == 2 &&
            <div className="next-button button" onClick={ () => window.location.reload() }>
              <h3>Перейти к тестам</h3>
            </div>
          }

          <div className="buttons-panel">

            { state.paidStatus == 1 &&
            <>
              <div className="check-button button">
                <h3>Проверка оплаты</h3>
              </div>
            </>
            }

            { state.paidStatus == 0 &&
              <div className="pay-button button" onClick={ () => !state.disabled && pay() }>
                <h3>Получить доступ</h3>
              </div>
            }
          </div>

          { state.snackbar }
        </Panel>
      </View>
    </AppRoot>
  );
}
