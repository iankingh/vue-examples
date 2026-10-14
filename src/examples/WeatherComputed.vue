<script setup>
import { computed, ref } from 'vue';

const isHot = ref(true);
const info = computed(() => isHot.value ? '炎熱' : '涼爽');
function changeWeather() { isHot.value = !isHot.value; }
</script>

<template>
  <h1>ref 與 computed</h1>
  <p>ref 保存天氣狀態，computed 根據狀態計算顯示文字。</p>
  <h2>今天天氣很{{ info }}</h2>
  <button type="button" @click="changeWeather">切換天氣</button>
</template>
