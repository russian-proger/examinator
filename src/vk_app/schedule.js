import React from 'react';
import { Group, Cell, Header, List } from '@vkontakte/vkui';

export default function Schedule() {
  return (
    <>
    <Group mode="plain" header={<Header mode="secondary">12 ИВТ</Header>}>
      <List>
        <Cell description="30.12.2020&nbsp;  12:00-15:00">
          Информатика
        </Cell>
        <Cell description="11.01.2021&nbsp;  12:00-15:00">
          Основы программирования
        </Cell>
        <Cell description="14.01.2021&nbsp;  12:00-15:00">
          Начертательная геометрия
        </Cell>
        <Cell description="18.01.2021&nbsp;  12:00-15:00">
          Математический анализ
        </Cell>
      </List>
    </Group>
    <Group mode="plain" header={<Header mode="secondary">11 ИВТ</Header>}>
      <Cell description="30.12.2020&nbsp;  09:00-12:00">
        Информатика
      </Cell>
      <Cell description="11.01.2021&nbsp;  09:00-12:00">
        Основы программирования
      </Cell>
      <Cell description="14.01.2021&nbsp;  09:00-12:00">
        Начертательная геометрия
      </Cell>
      <Cell description="18.01.2021&nbsp;  09:00-12:00">
        Математический анализ
      </Cell>
    </Group>
    </>
  );
}