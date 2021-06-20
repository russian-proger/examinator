import React from 'react';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { Icon24ChevronRight } from '@vkontakte/icons';

import './Statistics.sass';
import { subjects } from './../../../../assets/robots';

import {
  Cell,
  Counter,
  FormItem,
  Headline,
  Group,
  List,
  PullToRefresh,
  ScreenSpinner,
  Select,
  Spacing,
  Spinner,
  Title
} from '@vkontakte/vkui';

import {CoreProvider} from '../../core/AppEngine';



function firstO(num, count) {
  return "0".repeat(Math.max(0, count - num.toString().length)) + num;
};

function formatDate(date) {
  const d = new Date(date);
  return `${firstO(d.getDate(), 2)}.${firstO(d.getMonth(), 2)}`
};

function formatDateTime(date) {
  const d = new Date(date);
  return formatDate(date) + ` ${firstO(d.getHours(), 2)}:${firstO(d.getMinutes(), 2)}`
};

function useStats(subject_id) {
  const app = React.useContext(CoreProvider);

  const key_name = `STATS_${subject_id}`;
  const hasStats = app.File.has(key_name);
  const [_, forceUpdate] = React.useReducer(x => x + 1, 1);

  const result = hasStats ? app.File.getFromCache(key_name) : null;

  function Refresh() {
    return new Promise(resolve => {
      app.Network.getStats(subject_id).then(res => {
        app.File.keep(key_name, res);
        forceUpdate();
        resolve();
      });
    });
  }

  React.useEffect(() => {
    if (!hasStats) {
      Refresh();
    }
  }, [subject_id]);

  return [result, Refresh];
}

export default function Statistics() {
  const app = React.useContext(CoreProvider);

  const [subject_id, setSubjectId] = React.useState(0);
  const [isFetching, setFetching] = React.useState(false);
  const [isLoading, setLoading] = React.useState(false);
  const [stats, refresh] = useStats(subject_id);

  function onRefresh() {
    setFetching(true);
    setLoading(true);
    refresh().then(() => {
      setLoading(false);
      setTimeout(() => setFetching(false), 500);
    });
  }

  React.useLayoutEffect(() => {
    if (stats == null || isLoading) return ;
    let destructors = new Array();

    /** @type {HTMLCanvasElement} */
    const last_tests_canvas = document.getElementById("last_tests_chart");
    if (last_tests_canvas != null) {
      last_tests_canvas.width = window.innerWidth;
      last_tests_canvas.height = last_tests_canvas.width * 0.8;
      let context = last_tests_canvas.getContext('2d');

      const bgColors = stats.results.slice(0, 20).reverse().map(v => `hsl(${v.correct_answers_c / v.tasks_c * 120}, 72%, 45%)`);

      let a_grad, a_width, a_height;
      function getAboveGradient(ctx, chartArea) {
        const chartWidth = chartArea.right - chartArea.left;
        const chartHeight = chartArea.bottom - chartArea.top;
        if (a_grad === null || a_width !== chartWidth || a_height !== chartHeight) {
          // Create the gradient because this is either the first render
          // or the size of the chart has changed
          a_width = chartWidth;
          a_height = chartHeight;
          a_grad = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          a_grad.addColorStop(0, 'hsl(0, 72%, 56%)');
          a_grad.addColorStop(0.5, 'hsl(60, 72%, 56%)');
          a_grad.addColorStop(1, 'hsl(120, 72%, 56%)');
        }
      
        return a_grad;
      }

      const chart = new Chart(context, {
        type: 'line',
        data: {
          labels: stats.results.slice(0, 20).reverse().map(v => formatDate(v.date)),
          datasets: [{
            label: '% Верных ответов',
            data: stats.results.slice(0, 20).reverse().map(v => (v.correct_answers_c / v.tasks_c * 100).toFixed(1)),
            backgroundColor: bgColors,
            borderJoinStyle: 'round',
            pointRadius: 6,
            pointHitRadius: 7,
            pointHoverRadius: 8,
            borderColor: function(context) {
              const chart = context.chart;
              const {ctx, chartArea} = chart;
              if (!chartArea) {
                return null;
              }

              return getAboveGradient(ctx, chartArea);
            },
            fill: {
              target: 'origin',
              above: function(context) {
                const chart = context.chart;
                const {ctx, chartArea} = chart;
                if (!chartArea) {
                  return null;
                }

                return getAboveGradient(ctx, chartArea);
              },
            }
          }]
        },
        options: {
          scales: {
            y: {
              suggestedMin: 0,
              suggestedMax: 100,
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });

      destructors.push(() => chart.destroy());
    }

    /** @type {HTMLCanvasElement} */
    const count_tests_canvas = document.getElementById("count_tests_chart");
    if (count_tests_canvas != null) {
      count_tests_canvas.width = window.innerWidth;
      count_tests_canvas.height = count_tests_canvas.width * 0.6 + 140;
      let context = count_tests_canvas.getContext('2d');

      const results = stats.results.slice(0, 20).reverse();
      const chart = new Chart(context, {
        type: 'line',
        data: {
          labels: results.map(v => formatDate(v.date)),
          datasets: [
            {
              label: 'Кол-во вопросов',
              data: results.map(v => v.tasks_c),
              borderJoinStyle: 'round',
              borderColor: "#1e88e5",
              backgroundColor: results.map(() => "#1e88e5"),
              hidden: true
            },
            {
              label: 'Правильные',
              data: results.map(v => v.correct_answers_c),
              borderJoinStyle: 'round',
              borderColor: "#4caf50",
              backgroundColor: results.map(() => "#4caf50"),
            },
            {
              label: 'Неправильные',
              data: results.map(v => v.tasks_c - v.correct_answers_c),
              borderJoinStyle: 'round',
              borderColor: "#f44336",
              backgroundColor: results.map(() => "#f44336")
            }
          ]
        },
        options: {
          elements: {
            point: {
              radius: 0
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              suggestedMax: 20,
            }
          },
          plugins: {
            legend: {
              position: "bottom",
              fullSize: true,

            }
          }
        }
      });

      destructors.push(() => chart.destroy());
    }

    /** @type {HTMLCanvasElement} */
    const last_ratio_canvas = document.getElementById("last_ratio_chart");
    if (last_ratio_canvas != null) {
      let context = last_ratio_canvas.getContext('2d');

      const chart = new Chart(context, {
        type: 'doughnut',
        data: {
          labels: ["Неверных", "Верных"],
          datasets: [{
            label: "Количество правильных и неправильных ответов",
            data: [parseInt(stats.counts.tasks_c - stats.counts.correct_answers_c), parseInt(stats.counts.correct_answers_c)],
            backgroundColor: ['#f44336', '#4caf50'],
            borderWidth: 1
          }]
        },
        options: {
          plugins: {
            legend: {
              display: false
            }
          }
        }
      });

      last_ratio_canvas.width = 200;
      last_ratio_canvas.height = last_ratio_canvas.width * 1;
      chart.resize();

      destructors.push(() => chart.destroy());
    }

    return () => destructors.forEach(v => v());
  }, [stats, isLoading]);

  function openTest(tid) {
    if (tid <= 105) return () => {};
    return () => {
      app.Event.dispatchEvent("openpopout", [<ScreenSpinner />]);
      let asset_url = `/assets/${ subjects[subject_id] }.json`;
      let test_url = `/tests/${ tid }`;
      Promise.all([
        app.File.loadFromURL(asset_url, true, true, false),
        app.File.loadFromURL(test_url, false)
      ]).then(([asset, test]) => {
        let [tasksCount, ..._tests] = test.split(' ');
        tasksCount = parseInt(tasksCount);
        const durations = new Array(tasksCount);
        const results = new Array(tasksCount);
        const answers = new Array(tasksCount);
        const tasks = new Array(tasksCount);
        
        for (let i = 0; i < _tests.length; ++i) {
          if (typeof _tests[i] == "string" && _tests[i][0] == "\"" && _tests[i][_tests[i].length - 1] != '"') {
            let j = 1;
            let s = _tests[i];
            for (; j < _tests.length - i; ++j) {
              s += _tests[i + j];
              if (s[s.length - 1] == "\"") {
                break;
              }
            }

            if (j != 0) {
              _tests.splice(i, j + 1, s);
            }
          }
        }

        for (let i = 0; i < tasksCount; ++i) {
          let _i = i * 4;
          durations[i] = parseInt(_tests[_i + 2]);
          results[i] = _tests[_i + 3] == '1';
          answers[i] = _tests[_i + 1].slice(1, -1);
          tasks[i] = asset.catalog.find(v => v.id == _tests[_i]);
        }

        const props = ({durations, results, answers, tasks, tasksCount, fromStats: true, subject_id});
        app.Event.dispatchEvent("openpanel", ["single-result", props]);
      }).catch((err) => {
        console.log("Произошла ошибка", err);
      }).finally(() => {
        app.Event.dispatchEvent("closepopout");
      })
    }
  }

  // Рендеринг
  if (stats === null) {
    return <FormItem><Spinner /></FormItem>;
  }


  const briefStats = (
    <>
    <div className="short-stats-wrapper">
      <div className="short-stats-item success">
        <span className="value">{stats.counts.correct_answers_c ?? 0}</span>
        <span className="descr">Правильно</span>
      </div>
      <div className="short-stats-item mistake">
        <span className="value"
          >{stats.results.length == 0 ? 0 : parseInt(stats.counts.tasks_c) - parseInt(stats.counts.correct_answers_c)}</span>
        <span className="descr">Неправильно</span>
      </div>
    </div>
    <div className="short-stats-wrapper">
      <div className="short-stats-item ratio">
        <span className="value">{stats.results.length == 0 ? 0 : (parseInt(stats.counts.correct_answers_c) / parseInt(stats.counts.tasks_c) * 100).toFixed(1)}</span>
        <span className="descr">% Верных</span>
      </div>
      <div className="short-stats-item total">
        <span className="value"
          >{stats.counts.tasks_c ?? 0}</span>
        <span className="descr">Итого</span>
      </div>
    </div>
    </>
  );

  return (
    <PullToRefresh onRefresh={onRefresh} isFetching={isFetching}>
      <Group>
        <FormItem top="Предмет">
          <Select
            value={subject_id}
            onChange={ev => setSubjectId(parseInt(ev.target.value))}
            options={["ЭВМ", "Интегралы", "Теория Информации"].map((label, value) => ({ label, value }))}
          />
        </FormItem>
        { stats.results.length == 0 &&
          <>
            <Spacing size={8} />
            { briefStats }
          </>
        }
        {!isLoading && stats.results.length != 0 &&
        <>
          <FormItem>
            <Title level="2" weight="medium">Краткая сводка</Title>
            <Spacing size={8} />
            <div className="flex-center">
              <div className="ratio-chart">
                <canvas id="last_ratio_chart" width="100" height="100"/>
              </div>
            </div>
          </FormItem>
          <Spacing size={8} />
          { briefStats }
          <Spacing separator size={16} />
          <FormItem>
            <Title level="2" weight="medium">Правильность ответов %</Title>
            <Spacing size={8} />
            <div className="flex-center">
              <canvas id="last_tests_chart" />
            </div>
          </FormItem>
          <Spacing separator size={16} />
          <FormItem>
            {/* <Title level="2" weight="medium"></Title> */}
            <Spacing size={8} />
            <div id="count_tests_chart_wrapper" className="flex-center">
              <canvas id="count_tests_chart" />
            </div>
          </FormItem>
          <Spacing size={16} />
          <FormItem>
            <Title level="2" weight="medium">Последние решённые тесты</Title>
          </FormItem>
          <div className="tests-list">
            <div className="tests-item top-item">
              <span>Дата</span>
              <span>Результат</span>
            </div>
            { stats.results.map(v => (
              <div onClick={ openTest(v.id) } key={v.id} className="tests-item">
                <span>{formatDateTime(v.date)}</span>
                <span>{v.correct_answers_c} из {v.tasks_c}</span>
                <span></span>
                { v.id > 105 && <div className="t-icon"><Icon24ChevronRight /></div> }
                { v.id <= 105 && <Counter size="s" mode="prominent">Устаревший формат</Counter>}
              </div>
            ))}
          </div>
        </>}
        <div className="pad"></div>
      </Group>
    </PullToRefresh>
  );
}