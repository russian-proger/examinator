import React from 'react';
import { Footer, Button, Div, Slider, Group, FormStatus, FormLayoutGroup, FormLayout, FixedLayout, Radio, Title, Input, Text, List, Cell } from '@vkontakte/vkui';

import { tests, Test } from "./tests_loader";

var gTimeout = 0;
export default function SingleTest(props) {
  /** @type {[{questionsCount: Number, subject: string}]} */
  const [settings, setSettings] = React.useState({
    questionsCount: 25,
    subject: "informatics"
  });

  /**
   * @type {[{
    * activity: string,
    * previewStep: Number,
    * errorMessage: string,
    * mTests: Array<Test>,
    * currentQuestion: Number
   * }]}
   */
  const [state, setState] = React.useState({
    activity: "settings",
    previewStep: 3,
    errorMessage: "",
    mTests: [],
    currentQuestion: 0,
    answers: [],
    correctAnswersCount: 0
  });

  React.useEffect(() => () => clearTimeout(gTimeout), []);

  function prepareTests(settings) {
    if (!tests.informatics || !tests.informatics.length) {
      return false;
    }
  
    var mTests = tests.informatics.slice().sort(() => Math.random() - 0.5);
    for (var i = 0; i < settings.questionsCount; ++i) {
      if (mTests[i].type != "select") continue;
      const answerValue = mTests[i].options[parseInt(mTests[i].answer)];
      mTests[i].options.sort(() => Math.random() - 0.5);
      mTests[i].answer = mTests[i].options.indexOf(answerValue).toString();
    }
    return mTests.slice(0, settings.questionsCount);
  }

  function changeActivity(cState, newActivity, settings=({})) {
    if (newActivity == "preview") {
      // Подготавливаем тесты
      // В ответ должен вернуть массив тестов или False в случае неудачи
      const mTests = prepareTests(settings);

      if (mTests) {
        const newState = { ...cState, activity: newActivity, previewStep: 3, mTests, correctAnswersCount: 0, answers: [] };
        setState(newState);

        // Запускаем превью
        gTimeout = setTimeout(() => updatePreview(newState), 1000);
      } else {
        const newState = { ...cState, activity: "error", errorMessage: "Произошла ошибка во время составления тестов"};
        setState(newState);
      }
    } else if (newActivity == "testing") {
      const newState = { ...cState, activity: newActivity, currentQuestion: 0 };
      setState(newState);
    }
  }

  function updatePreview(cState) {
    if (cState.previewStep > 1) {
      const newState = { ...cState, previewStep: cState.previewStep - 1 }
      setState(newState);
      gTimeout = setTimeout(() => updatePreview(newState), 1000);
    } else if (cState.previewStep == 1) {
      changeActivity(cState, "testing");
    }
  }

  function answerQuestion(cState, answer) {
    const isCorrect = cState.mTests[cState.currentQuestion].answer.toLowerCase().trim() == answer.toLowerCase().trim();
    var answers = cState.answers.slice();
    answers.push(answer);
    if (cState.currentQuestion == cState.mTests.length - 1) {
      setState({ ...cState, activity: "results", correctAnswersCount: cState.correctAnswersCount + isCorrect, answers });
    } else {
      setState({ ...cState, currentQuestion: cState.currentQuestion + 1, correctAnswersCount: cState.correctAnswersCount + isCorrect, answers });
    }
  }

  if (state.activity == "settings") {
    return (
    <>
      <FormLayout>
        <FormLayoutGroup top={`Количество вопросов: ${ settings.questionsCount }`}>
          <Slider onChange={ (val) => setSettings({ ...settings, questionsCount: val }) } defaultValue={ settings.questionsCount } max={ 50 } step={ 5 } />
        </FormLayoutGroup>
      </FormLayout>
      
      { settings.questionsCount < 5 &&
        <Div>
          <FormStatus header="Некорректное число вопросов" mode="default">Количество вопросов должно быть не менее 5</FormStatus>
        </Div>
      }
      
      <FormLayout>
        <FormLayoutGroup top={`Экзаменационная дисциплина`}>
          <Radio name="subject" value="informatics" defaultChecked>Информатика</Radio>
          <Radio name="subject" value="geometry" description="Недоступно" disabled>Начертательная геометрия</Radio>
          <Radio name="subject" value="analysis" description="Недоступно" disabled>Математический анализ</Radio>
        </FormLayoutGroup>
      </FormLayout>
  
      <FixedLayout vertical="bottom">
        <Div>
          <Button mode="primary" stretched size="xl" disabled={ settings.questionsCount < 5 } onClick={() => changeActivity(state, "preview", settings)}>Начать!</Button>
        </Div>
      </FixedLayout>
    </>
    )
  } else if (state.activity == "preview") {
    return (
      <div style={{ height: '100vh', paddingBottom: '150px', fontSize: '120pt', boxSizing: 'border-box', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span>{ state.previewStep }</span>
      </div>
    );
  } else if (state.activity == "testing") {
    return (
      <Question key={ state.currentQuestion } index={ state.currentQuestion } answerQuestion={ answer => answerQuestion(state, answer) } question={ state.mTests[state.currentQuestion] } />
    );
  } else if (state.activity == "results") {
    return (
      <>
        
        <Div>
          <Text weight="medium" style={{ marginBottom: 10 }}>Количество правильных ответов: { state.correctAnswersCount } из { settings.questionsCount } </Text>
          <Text weight="medium" style={{ marginBottom: 10 }}>Результат: { (state.correctAnswersCount / settings.questionsCount * 100).toFixed(2) }%</Text>
        </Div>
        { state.mTests.map((v, index) => (
          <ShQuestion key={ index } index={ index } userAnswer={ state.answers[index] } question={ v } />
        ))}
        <br/>
      </>
    )
  } else if (state.activity == "error") {
    return (
      <FormStatus header="Ошибка" mode="error">
        { state.errorMessage && state.errorMessage.length ? state.errorMessage : "Произошла неизвестная ошибка"}
      </FormStatus>
    )
  }
}

function ShQuestion(props) {
  const id = props.question.condition.split(' ')[0].slice(0, -1);
  return (
    <Group style={{ background: props.userAnswer.trim().toLowerCase() == props.question.answer.trim().toLowerCase() ? "#dcedc8" : "#ffcdd2" }} header={ <Div>Задание { props.index + 1 } (#{id})</Div> }>
      <Div>
        <Text weight="medium" style={{ marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: props.question.condition.split(' ').slice(1).join(' ') }}></Text>
      </Div>

      {/* Картинка, если имеется */}
      { props.question.picture &&
        <div style={{ display: 'flex', width: '100%', height: 200, backgroundImage: `url(/static/test-info-images/${ id }.png)`, backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }} />
      }

      {/* Тип выбора */}
      { props.question.type == "select" &&
        <List>
          { props.question.options.map((v, index) => (
            <Cell key={index}
              style={{ background: props.question.answer == index.toString() ? "#66bb6a" : (props.userAnswer == index.toString() ? "#ef5350" : "transparent") }}
            ><span dangerouslySetInnerHTML={{ __html: v }}/></Cell>
          )) }
        </List>
      }

      {/* Тип ввода */}
      { props.question.type == "input" &&
      <>
        <Div>
          <Text weight="medium">Ваш ответ: { props.userAnswer }</Text>
        </Div>
        <Div>
          <Text weight="medium">Правильный ответ: { props.question.answer }</Text>
        </Div>
      </>
      }
    </Group>
  )
}

/**
 * @param {{answerQuestion: Function, question: Test}} props
 */
function Question(props) {
  const [answer, setAnswer] = React.useState("");
  const id = props.question.condition.split(' ')[0].slice(0, -1);

  React.useLayoutEffect(() => {
    const handler = ({ key }) => {
      if (key == "Enter" && answer != "") {
        props.answerQuestion(answer);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [answer]);

  return (
    <div style={{ width: 'inherit', height: 'inherit' }}>
      <Div>
        <Title level="1" weight="bold" style={{ marginBottom: 10 }}>Задание { props.index + 1 } (#{id})</Title>
      </Div>
      <Group>
        <Div>
          <Title level="2" weight="semibold" style={{ marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: props.question.condition.split(' ').slice(1).join(' ') }}></Title>
        </Div>
      </Group>
      { props.question.picture &&
        <div style={{ display: 'flex', width: '100%', height: 200, backgroundImage: `url(/static/test-info-images/${ id }.png)`, backgroundPosition: 'center center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' }}>
        </div>
      }
      { props.question.type == "select" &&
        <FormLayout>
          <FormLayoutGroup top={`Выберите правильный ответ`}>
            { props.question.options.map((v, index) => (
              <Radio key={index} name="answer" onClick={() => setAnswer(index.toString())}><span dangerouslySetInnerHTML={{ __html: v }}/></Radio>
            )) }
          </FormLayoutGroup>
        </FormLayout>
      }
      { props.question.type == "input" &&
        <FormLayout>
          <FormLayoutGroup top={`Введите ответ`}>
            <Input type="text" onChange={ ev => setAnswer(ev.target.value) } />
          </FormLayoutGroup>
        </FormLayout>
      }
      <br/>
      <br/>
      <br/>
      <br/>
      <br/>
      <FixedLayout vertical="bottom">
        <Div style={{ background: 'white' }}>
          <Button disabled={ answer == "" } mode="primary" stretched size="xl" onClick={() => props.answerQuestion(answer)}>Ответить!</Button>
        </Div>
      </FixedLayout>
    </div>
  )
}