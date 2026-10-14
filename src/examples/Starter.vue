<script setup>
import { ref } from 'vue';
import ContactTable from '../../01-vue/v.vue';

const message = ref('Hello Vue 3!');
const items = ref([
  { id: 1, name: '小明', email: 'ming@example.com', phone: '範例電話', address: '台北' },
  { id: 2, name: '小花', email: 'hua@example.com', phone: '範例電話', address: '台中' },
]);
const selected = ref('尚未選擇');
function edit(item) { selected.value = item.name; }
function remove(item) { items.value = items.value.filter((entry) => entry.id !== item.id); }
</script>

<template>
  <h1>建立 Vue 3 應用與元件</h1>
  <h2>{{ message }}</h2>
  <p>使用 createApp 掛載應用；元件使用 &lt;script setup&gt;、ref、props 與 emits。</p>
  <p role="status">目前選擇：{{ selected }}</p>
  <ContactTable :items="items" @edit="edit" @del="remove" />
</template>
