<script setup>
defineProps({ items: { type: Array, required: true } });
defineEmits(['edit', 'del']);
</script>

<template>
  <div class="table-scroll">
    <table>
      <caption>聯絡人列表：props 傳入資料，emits 通知父元件操作</caption>
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Phone</th>
          <th scope="col">Address</th>
          <th scope="col">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in items" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ item.email }}</td>
          <td>{{ item.phone }}</td>
          <td>{{ item.address }}</td>
          <td>
            <button type="button" :aria-label="`選擇${item.name}`" @click="$emit('edit', item)">Edit</button>
            <button type="button" :aria-label="`刪除${item.name}`" @click="$emit('del', item)">Delete</button>
          </td>
        </tr>
        <tr v-if="items.length === 0"><td colspan="6">沒有聯絡人</td></tr>
      </tbody>
    </table>
  </div>
</template>
