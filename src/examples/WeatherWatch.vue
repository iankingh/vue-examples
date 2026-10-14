<script setup>
import { computed, ref, watch } from 'vue';

const isHot = ref(true);
const info = computed(() => isHot.value ? '炎熱' : '涼爽');
const history = ref([]);
watch(isHot, (newValue, oldValue) => {
  console.log('isHot被監視到了', newValue, oldValue);
  history.value.push(`isHot：${oldValue} → ${newValue}`);
});
function changeWeather() { isHot.value = !isHot.value; }
</script>

<template>
  <h1>watch 監視 ref</h1>
  <p>computed 產生顯示值；watch 在來源變更時記錄新值與舊值。</p>
  <h2>今天天氣很{{ info }}</h2>
  <button type="button" @click="changeWeather">切換天氣</button>
  <ol aria-label="監視紀錄">
    <li v-for="(record, index) in history" :key="index">{{ record }}</li>
  </ol>
</template>
