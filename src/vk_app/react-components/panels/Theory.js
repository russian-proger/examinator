import React from 'react';
import { CoreProvider } from '../../core/AppEngine';

import { Panel, PanelHeader, Group, FormItem, Select, CustomSelectOption, Checkbox, Cell, Header, List, PanelHeaderBack, CellButton, Div, Text, Headline, Button, Separator } from '@vkontakte/vkui';

import Code from '../others/Code';
import { HtmlKatex } from './../TaskElements';

import { Icon24ChevronDown } from '@vkontakte/icons';
import { Icon24ChevronUp } from '@vkontakte/icons';

import './Theory.sass';

/**
 * @param {Object} props
 * @param {string} props.type
 */
export default function VTheory(props) {
  const app = React.useContext(CoreProvider);
  const materials = props.materials;

  const [state, setState] = React.useState({
    tasks_type: materials && materials.separated ? 1 : 0,
    only_solved: false
  });

  let problems = [];
  if (materials) {
    problems = materials.catalog.filter(v => !state.tasks_type || v.category == state.tasks_type - 1).filter(v => !state.only_solved || v.hasOwnProperty('solve'));
  }

  return (
    <Panel id={ props.id }>
      <PanelHeader left={ <PanelHeaderBack onClick={ () => app.Event.dispatchEvent("closepanel") } /> }>
        { materials == null ?  "Загрузка..." : materials.subject_name }
      </PanelHeader>

      <Group>
        { materials != null && materials.separated &&
          <FormItem top="Тип заданий">
            <Select
              defaultValue={1}
              options={["Все задания", ...materials.categories].map((v, i) => ({label: v, value: i}))}
              renderOption={({ option, ...restProps }) => (
                <CustomSelectOption {...restProps} />
              )}
              onChange={(ev) => setState({...state, tasks_type: parseInt(ev.target.value)})}
            />
          </FormItem>
        }
        { materials != null && materials.has_solves &&
          <FormItem>
            <Checkbox value={state.only_solved} onChange={ () => setState({ ...state, only_solved: !state.only_solved }) }>Показать только решённые</Checkbox>
          </FormItem>
        }
      </Group>
      
      <div className="problems-wrapper">
        { materials && problems.map((problem, p_index) => (
          <Problem key={p_index} index={ p_index } problem={ problem } subject_id={ props.subject_id } />
        ))
        }
      </div>
    </Panel>
  )
}

function Problem(props) {
  const [expanded, setExpanded] = React.useState(false);
  let hasSolving = props.problem.hasOwnProperty('solve');

  return (
    <div className="problem">
      <Div className="problem-question">
        <Text weight="medium">Вопрос №{ props.problem.id }: <HtmlKatex text={props.problem.question} /></Text>
      </Div>
      { hasSolving &&
        <>
          <Button mode="tertiary" onClick={() => setExpanded(!expanded)} after={expanded ? <Icon24ChevronUp /> : <Icon24ChevronDown />}>
            {expanded ? "Скрыть решение" : "Показать решение"}
          </Button>
          {expanded &&
            <Div className="solving">
              <Text weight="medium"><HtmlKatex text={props.problem.solve} /></Text>
            </Div>
          }
        </>
      }
      { props.problem.type == "text" &&
        <Div>
          {expanded ?
            <Button size="l" mode="secondary" onClick={ () => setExpanded(false) }>Скрыть ответ</Button>
            : <Button size="l" mode="primary" onClick={ () => setExpanded(true) }>Показать ответ</Button>}
          {expanded &&
            <div style={{ marginTop: 15 }} dangerouslySetInnerHTML={{ __html: props.problem.answer }}></div>
          }
        </Div>
      }

      { props.problem.picture &&
        <Div style={{ display: 'flex', justifyContent: 'center', width: '100%', boxSizing: 'border-box' }}>
          <T_Image src={`/static/pictures/${props.subject_id}/${props.problem.picture}`} />
        </Div>
      }

      { props.problem.type == "code" &&
        <Div>
          { expanded ?
            <><Button style={{ marginBottom: 15 }} size="l" mode="secondary" onClick={ () => setExpanded(false) }>Скрыть решение</Button><Code code={ props.problem.answer } /></>
            : <Button size="l" mode="primary" onClick={ () => setExpanded(true) }>Показать решение</Button>}
        </Div>
      }
      { props.problem.type == "input" &&
        <Div>
          <Text weight="medium">Ответ: <span dangerouslySetInnerHTML={{ __html: '(' + props.problem.answer.join('|') + ')' }} /></Text>
        </Div>
      }
      { (props.problem.type == "radio" || props.problem.type == "select") &&
        <Div>
          { props.problem.options.map((v, i) => (
            <div style={{
                backgroundColor: props.problem.answer.indexOf(i.toString()) != -1 ? "#a5d6a7" : "transparent",
                border: '1px solid #505050',
                borderBottomWidth: i == props.problem.options.length - 1 ? '1px' : '0',
                padding: 2
              }}
              key={ i }>
              <HtmlKatex text={v} />
            </div>
          ))}
        </Div>
      }
      { props.problem.type == "order" &&
        <Div>
          { props.problem.answer.split('').map((v, i) => (
            <div key={ i }>
              <HtmlKatex text={`${i + 1}: ` + props.problem.options[parseInt(v)]} />
            </div>
          ))}
          <Text style={{ marginTop: 10, borderTop: '2px solid rgb(219 240 241)' }} weight="semibold" color="gray">*В этом задании нужно расположить элементы в правильном порядке</Text>
        </Div>
      }

    </div>
  )
}

function T_Image(props) {
  const [dimensions, setDimensions] = React.useState({ w: 1, h: 1 });

  React.useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const mxw = document.body.clientWidth * 0.7;
      const mxh = document.body.clientHeight * 0.35;
      var nd = { w: img.width, h: img.height };
      if (nd.w > mxw) {
        nd.h = mxw * nd.h / nd.w;
        nd.w = mxw;
      }
      if (nd.h > mxh) {
        nd.w = mxh * nd.w / nd.h;
        nd.h = mxh;
      }
      setDimensions(nd);
    };
    img.src = props.src;
  }, [props.src]);

  return (
    <img src={ props.src } width={ dimensions.w } height={ dimensions.h } />
  )
}