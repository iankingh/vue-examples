<script setup>
import { ref, watch } from 'vue';

const numbers = ref({ a: 1, b: 2 });
const history = ref([]);
watch(numbers, (newValue, oldValue) => {
  console.log('numbers被監視到了', newValue, oldValue);
  // 保存顯示用快照；deep watch 本身不會保存變更前的深層副本。
  history.value.push({
    value: { ...newValue },
    oldValue: { ...oldValue },
    sameReference: newValue === oldValue,
  });
}, { deep: true });
function replaceNumbers() { numbers.value = { a: 6666, b: 8888 }; }
</script>

<template>
  <h1>深度監視與物件替換</h1>
  <p>watch(ref) 預設監視物件替換；deep: true 也會監視內部屬性變化。</p>
  <p>修改內部屬性時，新舊值指向同一個物件；替換整個物件時，新舊引用不同。</p>
  <h2>numbers.a: {{ numbers.a }}</h2>
  <button type="button" @click="numbers.a++">點我a+1</button>
  <h2>numbers.b: {{ numbers.b }}</h2>
  <button type="button" @click="numbers.b++">點我b+1</button>
  <button type="button" @click="replaceNumbers">換掉numbers</button>
  <ol aria-label="深度監視紀錄">
    <li v-for="(record, index) in history" :key="index">
      {{ record.oldValue }} → {{ record.value }}；相同引用：{{ record.sameReference }}
    </li>
  </ol>
</template>
