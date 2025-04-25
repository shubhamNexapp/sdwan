<script setup lang="ts">
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
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { useNotificationsStore } from '@/stores/notifications'

import { useI18n } from "vue-i18n";


const t = useI18n()

const loading = ref({ saveRule: false })

const notificationsStore = useNotificationsStore()

const service = ref(false);
const redistributeConnect = ref(false);
const redistributeStatic = ref(false);
const redistributeKernel = ref(false);

let apiResponse = ref()
const newNeighbours = ref<{ neighbor_ip: string }[]>([])
const networks = ref<{ network: string }[]>([])

watch(
  () => apiResponse.value,
  (newValue) => {
    if (newValue) {
      service.value = newValue.service === 'enable';
      redistributeConnect.value = newValue.rdb_connected === 'enable';
      redistributeStatic.value = newValue.rdb_static === 'enable';
      redistributeKernel.value = newValue.rdb_kernel === 'enable';
      newNeighbours.value = newValue.neighbor || [];
      networks.value = newValue.network_conf || [];
    }
  },
  { immediate: true }
);

onMounted(() => {
  getLists();
});

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/rip`, {
      method: 'get-config',
      payload: {}
    });
    if (response.data.code === 200) {
      apiResponse.value = response.data.data;
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

const addNeighbour = () => {
  newNeighbours.value.push({ neighbor_ip: '' });
};

const addNetwork = () => {
  networks.value.push({ network: '' });
};

const deleteNeighbour = (index: number) => {
  newNeighbours.value.splice(index, 1);
};

const deleteNetwork = (index: number) => {
  networks.value.splice(index, 1);
};

const saveNetworkConfig = async () => {
  loading.value.saveRule = true;
  try {
    const payload = {
      method: "set-config",
      payload: {
        service: service.value ? "enable" : "disable",
        rdb_connected: redistributeConnect.value ? "enable" : "disable",
        rdb_static: redistributeStatic.value ? "enable" : "disable",
        rdb_kernel: redistributeKernel.value ? "enable" : "disable",
        neighbor: newNeighbours.value,
        network_conf: networks.value,
      }
    };

    await axios.post(`${getSDControllerApiEndpoint()}/rip`, payload);
    getLists(); // Refresh list after saving
    notificationsStore.createNotification({
      title: 'Success',
      description: 'Configuration saved successfully.',
      kind: 'success'
    })
  } catch (err) {
    console.error("Error saving data:", err);
  } finally {
    loading.value.saveRule = false;
  }
};

interface Neighbour {
  neighbor_ip: string;
}

interface Network {
  network: string;
}

const validateIp = (
  event: Event,
  index: number,
  field: keyof Neighbour
) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, '');

  // Safely update the correct item
  newNeighbours.value[index][field] = input.value;
};


const validateIpNetwork = (
  event: Event,
  index: number,
  field: keyof Network
) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, '');

  // Safely update the correct item
  networks.value[index][field] = input.value;
};


</script>

<template>
  <!-- <NeHeading tag="h3" class="mb-7">RIP</NeHeading>
  <NeToggle v-model="service" label="RIP Service" /> -->
  <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'RIP Service'" />


  <template v-if="service">
    <div class="flex flex-col gap-y-6">
      <div>
        <div class="flex flex-col items-start mb-4">
          <div class="w-full flex flex-col gap-3 mt-4">
            <NeToggle v-model="redistributeConnect" :label="redistributeConnect ? 'Enable' : 'Disable'" :topLabel="'Redisribute Connect'" />
            <NeToggle v-model="redistributeStatic" :label="redistributeStatic ? 'Enable' : 'Disable'" :topLabel="'Redisribute Static'" />
            <NeToggle v-model="redistributeKernel" :label="redistributeKernel ? 'Enable' : 'Disable'" :topLabel="'Redisribute Kernel'" />
          </div>
        </div>

        <!-- Neighbours Table -->
        <div class="flex flex-row items-center justify-between mt-4">
          <p class="max-w-2xl font-bold text-black dark:text-gray-400">Neighbour</p>
          <NeButton kind="primary" size="lg" @click="addNeighbour">
            <template #prefix>
              <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
            </template>
            Add
          </NeButton>
        </div>

        <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Neighbour Table">
          <NeTableHead>
            <NeTableHeadCell>Neighbor</NeTableHeadCell>
            <NeTableHeadCell>Operations</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in newNeighbours" :key="`new-${index}`">
              <NeTableCell>
                <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbour"
                  @input="(e: Event) => validateIp(e, index, 'neighbor_ip')" />
              </NeTableCell>
              <NeTableCell>
                <NeButton size="sm" class="mt-5" @click=deleteNeighbour(index)>
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                </NeButton>
              </NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>

        <!-- Neighbours Table -->
        <div class="flex flex-row items-center justify-between mt-4">
          <p class="max-w-2xl font-bold text-black dark:text-gray-400">Network</p>
          <NeButton kind="primary" size="lg" @click="addNetwork">
            <template #prefix>
              <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
            </template>
            Add
          </NeButton>
        </div>

        <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Neighbour Table">
          <NeTableHead>
            <NeTableHeadCell>Network</NeTableHeadCell>
            <NeTableHeadCell>Operations</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in networks" :key="`new-${index}`">
              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.network" placeholder="Neighbour" /> -->
                <NeTextInput v-model.trim="item.network" placeholder="Network"
                  @input="(e: Event) => validateIpNetwork(e, index, 'network')" />
              </NeTableCell>
              <NeTableCell>
                <NeButton size="sm" class="mt-5" @click=deleteNetwork(index)>
                  <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                </NeButton>
              </NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>


        <!-- Save Button -->

      </div>
    </div>
  </template>

  <div class="mt-4 flex justify-end">
    <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
      Save
    </NeButton>
  </div>
</template>
