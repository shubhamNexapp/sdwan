<script setup>
import { onMounted, ref } from 'vue'
import {
  NeHeading,
  NeButton,
  NeTable,
  NeTableHead,
  NeTableHeadCell,
  NeTableBody,
  NeTableRow,
  NeTableCell,
  NeToggle,
  NeTextInput
} from '@nethesis/vue-components'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { useNotificationsStore } from '@/stores/notifications'

const files = ref([])
const notificationsStore = useNotificationsStore()


onMounted(() => {
  getLists()
})

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
      method: 'get-config',
      payload: {}
    });


    if (response.data.code === 200) {
      // Set the files from response
      // const isolateFileString = response.data.data.isolate_file || ''
      const isolateFileString = {
        "data": {
          "service": "",
          "scan_path": "",
          "scan_interval": "",
          "auto_update": "",
          "scan_now": "",
          "result": "No scanning task has been started or scanning is in progress, please wait for 15 minutes at most!",
          "isolate_file": "test_file,testfile2,testfile3"
        },
        "code": 200
      }

      // split by '\n' and filter empty strings
      files.value = isolateFileString.split('\n').filter(file => file.trim() !== '')

    }
  } catch (err) {
  }
};

const recover = async (file) => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
      method: 'action-config',
      "payload": {
        "file_name": file,
        "action": "recovery"
      }
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'File recover successfully.',
        kind: 'success'
      })
      await getLists()   // 👈 Refresh the list after successful delete
    }
  } catch (err) {
  }
}

const deleteFile = async (file) => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
      method: 'action-config',
      "payload": {
        "file_name": file,
        "action": "delete"
      }
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'File delte successfully.',
        kind: 'success'
      })
      await getLists()   // 👈 Refresh the list after successful delete
    }
  } catch (err) {
  }
}

</script>

<template>
  <div class="container">
    <!-- <table class="simple-table">
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
    </table> -->

    <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Neighbour Table">
      <NeTableHead>
        <NeTableHeadCell>Sr.no</NeTableHeadCell>
        <NeTableHeadCell>Isolate File</NeTableHeadCell>
        <NeTableHeadCell>Operations</NeTableHeadCell>
      </NeTableHead>
      <NeTableBody>
        <NeTableRow v-for="(file, index) in files" :key="index">
          <NeTableCell>{{ index + 1 }}</NeTableCell>
          <NeTableCell>{{ file }}</NeTableCell>
          <NeTableCell>
            <NeButton kind="primary" @click.prevent="recover(file)">
              <FontAwesomeIcon :icon="faSave" />
              Recovery
            </NeButton>
            <NeButton kind="primary" @click.prevent="deleteFile(file)">
              Delete
            </NeButton>
          </NeTableCell>
        </NeTableRow>
      </NeTableBody>
    </NeTable>
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
