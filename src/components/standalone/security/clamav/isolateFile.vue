<script setup>
import { ref } from 'vue'

const files = ref(['test_1', 'test_2', 'test_3'])

const recover = (file) => {
  alert(`Recovering ${file}`)
}

const deleteFile = (file) => {
  alert(`Deleting ${file}`)
}
</script>

<template>
  <div class="container">
    <table class="simple-table">
      <thead>
        <tr>
          <th>Isolate File</th>
          <th>Operations</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(file, index) in files" :key="index">
          <td>{{ file }}</td>
          <td>
            <button @click="recover(file)">Recovery</button>
            <button @click="deleteFile(file)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 20px auto;
}

.simple-table {
  width: 100%;
  border-collapse: collapse;
}

.simple-table th,
.simple-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}

.simple-table th {
  background-color: #f4f4f4;
}

button {
  margin-right: 10px;
  padding: 6px 12px;
  cursor: pointer;
}

button {
  background-color: #279599;
}
</style>
