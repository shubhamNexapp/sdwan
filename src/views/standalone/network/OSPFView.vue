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

const loading = ref({ saveRule: false })

const service = ref(false);
const redistributeConnect = ref(false);
const redistributeStatic = ref(false);
const redistributeKernel = ref(false);

let apiResponse = ref()
const newNeighbours = ref<{ neighbor_ip: string }[]>([])
const newNetwork = ref<{ network: string, area_number: string }[]>([])
const interfaceNew = ref<{ interface_name: string, cost: string, network_type: string }[]>([])

watch(
  () => apiResponse.value,
  (newValue) => {
    if (newValue) {
      service.value = newValue.service === 'enable';
      redistributeConnect.value = newValue.rdb_connected === 'enable';
      redistributeStatic.value = newValue.rdb_static === 'enable';
      redistributeKernel.value = newValue.rdb_kernel === 'enable';
      newNeighbours.value = newValue.neighbor || [];
      newNetwork.value = newValue.network_conf || [];
      // interfaceNew.value = newValue.interface_conf || [];

      // Ensure interface values are mapped correctly
      interfaceNew.value = newValue.interface_conf?.map((item: any) => ({
        interface_name: item.interface_name || '',
        cost: item.cost || '',
        network_type: item.network_type || ''
      })) || [];

    }
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  getLists();
});

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ospf`, {
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
  newNetwork.value.push({ network: '', area_number: '' });
};

const addInterFace = () => {
  interfaceNew.value.push({
    interface_name: 'br-lan',  // Default to 'br-lan'
    cost: '',
    network_type: 'broadcast'  // Default to 'broadcast'
  });
};

const deleteNeighbour = (index: number) => {
  newNeighbours.value.splice(index, 1);
};

const deleteNetwork = (index: number) => {
  newNetwork.value.splice(index, 1);
};

const deleteInterface = (index: number) => {
  interfaceNew.value.splice(index, 1);
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
        network_conf: newNetwork.value,
        interface_conf: interfaceNew.value
      }
    };

    await axios.post(`${getSDControllerApiEndpoint()}/ospf`, payload);
    getLists(); // Refresh list after saving
  } catch (err) {
    console.error("Error saving data:", err);
  } finally {
    loading.value.saveRule = false;
  }
};

</script>

<template>
  <NeHeading tag="h3" class="mb-7">OSPF</NeHeading>
  <div class="flex flex-col gap-y-6">
    <div>
      <div class="flex flex-col items-start mb-4">
        <NeToggle v-model="service" label="OSPF Service" />
        <div class="w-full flex flex-col gap-3 mt-4">
          <NeToggle v-model="redistributeConnect" label="Redisribute Connect" />
          <NeToggle v-model="redistributeStatic" label="Redisribute Static" />
          <NeToggle v-model="redistributeKernel" label="Redisribute Kernel" />
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
              <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbour" />
            </NeTableCell>
            <NeTableCell>
              <NeButton size="sm" class="mt-5" @click=deleteNeighbour(index)>
                <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
              </NeButton>
            </NeTableCell>
            <!-- <NeButton kind="danger" size="sm" @click="deleteNeighbour(index)">Delete</NeButton> -->
          </NeTableRow>
        </NeTableBody>
      </NeTable>

      <!-- Networks Table -->
      <div class="flex flex-row items-center justify-between mt-6">
        <p class="max-w-2xl font-bold text-black dark:text-gray-400">Network</p>
        <NeButton kind="primary" size="lg" @click="addNetwork">
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
          </template>
          Add
        </NeButton>
      </div>

      <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Network Table">
        <NeTableHead>
          <NeTableHeadCell>Network</NeTableHeadCell>
          <NeTableHeadCell>Area Number</NeTableHeadCell>
          <NeTableHeadCell>Operations</NeTableHeadCell>
        </NeTableHead>
        <NeTableBody>
          <NeTableRow v-for="(item, index) in newNetwork" :key="`new-${index}`">
            <NeTableCell>
              <NeTextInput v-model.trim="item.network" placeholder="Network" />
            </NeTableCell>
            <NeTableCell>
              <NeTextInput v-model.trim="item.area_number" placeholder="Network" />
            </NeTableCell>
            <NeTableCell>
              <NeButton size="sm" @click="deleteNetwork(index)">
                <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
              </NeButton>
              <!-- <NeButton kind="danger" size="sm" @click="deleteNetwork(index)">Delete</NeButton> -->
            </NeTableCell>
          </NeTableRow>
        </NeTableBody>
      </NeTable>

      <!-- Interface Table -->
      <div class="flex flex-row items-center justify-between mt-6">
        <p class="max-w-2xl font-bold text-black dark:text-gray-400">Interface</p>
        <NeButton kind="primary" size="lg" @click="addInterFace">
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
          </template>
          Add
        </NeButton>
      </div>

      <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Interface Table">
        <NeTableHead>
          <NeTableHeadCell>Interface</NeTableHeadCell>
          <NeTableHeadCell>Cost</NeTableHeadCell>
          <NeTableHeadCell>Network Type</NeTableHeadCell>
          <NeTableHeadCell>Operations</NeTableHeadCell>
        </NeTableHead>
        <NeTableBody>
          <NeTableRow v-for="(item, index) in interfaceNew" :key="`new-${index}`">
            <NeTableCell>
              <select v-model="item.interface_name">
                <option value="br-lan">br-lan</option>
                <option value="br-wan">br-wan</option>
                <option value="eth5">ETH5</option>
                <option value="eth1">ETH1</option>
              </select>
            </NeTableCell>
            <NeTableCell>
              <NeTextInput v-model.trim="item.cost" placeholder="Cost" />
            </NeTableCell>
            <NeTableCell>
              <select v-model="item.network_type">
                <option value="broadcast">Broadcast</option>
                <option value="non-broadcast">Non-Broadcast</option>
                <option value="point-to-multipoint">Point-to-Multipoint</option>
                <option value="point-to-point">Point-to-Point</option>
              </select>
            </NeTableCell>
            <NeTableCell>
              <NeButton size="sm" @click="deleteInterface(index)">
                <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
              </NeButton>
            </NeTableCell>
          </NeTableRow>
        </NeTableBody>
      </NeTable>

      <!-- Save Button -->
      <div class="mt-4 flex justify-end">
        <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
          Save
        </NeButton>
      </div>
    </div>
  </div>
</template>
