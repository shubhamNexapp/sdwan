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

const loading = ref({ saveRule: false })

const notificationsStore = useNotificationsStore()

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
  { immediate: true }
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
  area_number: string;
}

interface InterfaceNew {
  cost: string;
}

const validateIp = (
  event: Event,
  index: number,
  field: keyof Neighbour
) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, '');
  newNeighbours.value[index][field] = input.value;
};

const validateIpNetwork = (
  event: Event,
  index: number,
  field: keyof Network
) => {
  const input = event.target as HTMLInputElement;
  // Apply different validation rules based on the field
  if (field === 'network') {
    input.value = input.value.replace(/[^0-9./]/g, '');
  } else if (field === 'area_number') {
    // Allow only digits
    let value = input.value.replace(/[^0-9]/g, '');

    // Convert to number and clamp between 0-65535
    const num = Math.min(65535, Math.max(0, Number(value)));
    input.value = isNaN(num) ? '' : num.toString();
  }
  newNetwork.value[index][field] = input.value;
};

const validateInterfaceNew = (
  event: Event,
  index: number,
  field: keyof InterfaceNew
) => {
  const input = event.target as HTMLInputElement;
  // Allow only digits
  let value = input.value.replace(/[^0-9]/g, '');

  // Convert to number and clamp between 0-65535
  const num = Math.min(65535, Math.max(0, Number(value)));
  input.value = isNaN(num) ? '' : num.toString();
  interfaceNew.value[index][field] = input.value;
};

</script>

<template>
  <NeHeading tag="h3" class="mb-7">OSPF</NeHeading>
  <!-- <NeToggle v-model="service" label="OSPF Service" /> -->
  <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'OSPF Service'" />

  <template v-if="service">
    <div class="flex flex-col gap-y-6">
      <div>
        <div class="flex flex-col items-start mb-4">
          <div class="w-full flex flex-col gap-3 mt-4">

            <NeToggle v-model="redistributeConnect" :label="redistributeConnect ? 'Enable' : 'Disable'"
              :topLabel="'Redisribute Connect'" />
            <NeToggle v-model="redistributeStatic" :label="redistributeStatic ? 'Enable' : 'Disable'"
              :topLabel="'Redisribute Static'" />
            <NeToggle v-model="redistributeKernel" :label="redistributeKernel ? 'Enable' : 'Disable'"
              :topLabel="'Redisribute Kernel'" />


            <!-- <NeToggle v-model="redistributeConnect" label="Redisribute Connect" />
            <NeToggle v-model="redistributeStatic" label="Redisribute Static" />
            <NeToggle v-model="redistributeKernel" label="Redisribute Kernel" /> -->
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
                <!-- <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbour" /> -->
                <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbour"
                  @input="(e: Event) => validateIp(e, index, 'neighbor_ip')" />
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
                <!-- <NeTextInput v-model.trim="item.network" placeholder="Network" /> -->
                <NeTextInput v-model.trim="item.network" placeholder="Network"
                  @input="(e: Event) => validateIpNetwork(e, index, 'network')" />
              </NeTableCell>
              <NeTableCell>
                <NeTextInput v-model.trim="item.area_number" placeholder="Area Number"
                  @input="(e: Event) => validateIpNetwork(e, index, 'area_number')" />
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
                <!-- <NeTextInput v-model.trim="item.cost" placeholder="Cost" /> -->
                <NeTextInput v-model.trim="item.cost" placeholder="Cost"
                  @input="(e: Event) => validateInterfaceNew(e, index, 'cost')" />
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
      </div>
    </div>
  </template>
  <!-- Save Button -->
  <div class="mt-4 flex justify-end">
    <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
      Save
    </NeButton>
  </div>
</template>
