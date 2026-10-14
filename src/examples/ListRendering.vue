<script setup>
import { reactive } from 'vue';

const persons = reactive([
  { id: 1, name: '小明', age: 18 },
  { id: 2, name: '小花', age: 19 },
  { id: 3, name: '小美', age: 20 },
  { id: 4, name: '小強', age: 21 },
  { id: 5, name: '小雞', age: 22 },
]);
const car = reactive({ brand: 'BMW', price: 1000000, color: 'red' });
let nextId = 6;
function addPerson() { persons.unshift({ id: nextId++, name: '新同學', age: 23 }); }
function removeFirst() { persons.shift(); }
</script>

<template>
  <h1>列表渲染與 key</h1>
  <div class="controls">
    <button type="button" @click="persons.reverse()">反轉順序</button>
    <button type="button" @click="addPerson">新增同學</button>
    <button type="button" :disabled="persons.length === 0" @click="removeFirst">移除第一位</button>
  </div>
  <h2>人員列表：使用穩定 ID</h2>
  <ul data-testid="id-list">
    <li v-for="person in persons" :key="person.id">
      <span>{{ person.id }} {{ person.name }} {{ person.age }}</span>
      <input :placeholder="person.name" :aria-label="`${person.name}的未儲存輸入（ID key）`">
    </li>
  </ul>
  <h2>人員列表：使用 index</h2>
  <p>此處刻意用 index 作為 key；重排後，未受 Vue 綁定的輸入值會留在原位置，可能對應到另一位同學。</p>
  <ul data-testid="index-list">
    <li v-for="(person, index) in persons" :key="index">
      {{ index }}-{{ person.name }}
      <input :placeholder="person.name" :aria-label="`${person.name}的未儲存輸入（index key）`">
    </li>
  </ul>
  <h2>汽車訊息：物件渲染</h2>
  <ul data-testid="car-list">
    <li v-for="(value, key) in car" :key="key">{{ key }}-{{ value }}</li>
  </ul>
</template>
