<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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
  NeTextInput,
  NeTooltip
} from '@nethesis/vue-components'
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { MessageBag } from '@/lib/validation'
import { useNotificationsStore } from '@/stores/notifications'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const { t } = useI18n()

const notificationsStore = useNotificationsStore()

const errorBag = ref(new MessageBag())
const loading = ref({ saveRule: false })

const routeIDRef = ref('');
const routeID = ref('');
const service = ref(false);
const routeAS = ref('');
const routeASRef = ref('');

let apiResponse = ref()
const newNeighbours = ref<{ neighbor_ip: string, neighbor_as: string }[]>([])
const newNetwork = ref<{ network: string }[]>([])

watch(
  () => apiResponse.value,
  (newValue) => {
    if (newValue) {
      service.value = newValue.service === 'enable';
      routeAS.value = newValue.route_as || "";
      routeID.value = newValue.route_id || "";
      newNeighbours.value = newValue.neighbor || [];
      newNetwork.value = newValue.network || [];
    }
  },
  { immediate: true }
);

onMounted(() => {
  getLists();
});

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/bgp`, {
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
  newNeighbours.value.push({ neighbor_ip: '', neighbor_as: '' });
};

const addNetwork = () => {
  newNetwork.value.push({ network: '' });
};

const deleteNeighbour = (index: number) => {
  newNeighbours.value.splice(index, 1);
};

const deleteNetwork = (index: number) => {
  newNetwork.value.splice(index, 1);
};

const saveNetworkConfig = async () => {
  loading.value.saveRule = true;
  try {
    const payload = {
      method: "set-config",
      payload: {
        service: service.value ? "enable" : "disable",
        route_as: routeAS.value,
        route_id: routeID.value,
        neighbor: newNeighbours.value,
        network_segments: newNetwork.value
      }
    };

    await axios.post(`${getSDControllerApiEndpoint()}/bgp`, payload);
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
  neighbor_as: string;
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
  // Apply different validation rules based on the field
  if (field === 'neighbor_ip') {
    input.value = input.value.replace(/[^0-9./]/g, '');
  } else if (field === 'neighbor_as') {
    // Allow only digits
    let value = input.value.replace(/[^0-9]/g, '');

    // Convert to number and clamp between 0-65535
    const num = Math.min(65535, Math.max(0, Number(value)));
    input.value = isNaN(num) ? '' : num.toString();
  }
  newNeighbours.value[index][field] = input.value;
};

const validateNewNetwork = (
  event: Event,
  index: number,
  field: keyof Network
) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, '');
  newNetwork.value[index][field] = input.value;
};

const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/[^0-9]/g, '');

  // Clamp the value between 1 and 65535
  const num = parseInt(value, 10);
  if (!isNaN(num)) {
    if (num < 1) {
      value = '1';
    } else if (num > 65535) {
      value = '65535';
    } else {
      value = num.toString();
    }
  } else {
    value = '';
  }

  input.value = value;
};

const onlyIP = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^0-9./]/g, '');
}


</script>

<template>
  <NeHeading tag="h3" class="mb-4">BGP</NeHeading>
  <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
    {{ t('standalone.ping_latency_monitor.description') }}
  </p>
  <NeToggle class="mb-4" v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'BGP Service'" />
  <!-- Show form fields only if status is enabled -->
  <template v-if="service">
    <div class="flex flex-col gap-y-6">
      <div>
        <div class="flex flex-col items-start space-y-4">
          <div class="flex flex-col w-full gap-3">
            <NeTextInput @input="onlyIP" :disabled="loading.saveRule" ref="routeIDRef" v-model="routeID"
              :invalidMessage="errorBag.getFirstFor('routeID')" :label="t('Route ID')"
              :placeholder="t('Enter Route ID')">
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t('standalone.logs.search_tooltip') }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>
            <!-- <NeTextInput :label="t('Route ID')" v-model.trim="routeID" @input="onlyIP"
              :invalidMessage="errorBag.getFirstFor('routeID')" :disabled="loading.saveRule" ref="routeIDRef" /> -->
            <NeTextInput @input="onlyNumbers" :disabled="loading.saveRule" ref="routeASRef" v-model="routeAS"
              :invalidMessage="errorBag.getFirstFor('routeAS')" :label="t('Route AS')"
              :placeholder="t('Enter Route AS')">
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t('standalone.logs.search_tooltip') }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>
            <!-- <NeTextInput :label="t('Route AS')" v-model.trim="routeAS" @input="onlyNumbers"
              :invalidMessage="errorBag.getFirstFor('routeAS')" :disabled="loading.saveRule" ref="routeASRef" /> -->
          </div>
        </div>

        <!-- Neighbours Table -->
        <div class="flex flex-row items-center justify-between mt-4">
          <p class="max-w-2xl font-bold text-black dark:text-gray-400">Neighbour</p>
          <NeButton kind="primary" size="lg" @click="addNeighbour">
            <template #prefix>
              <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" aria-hidden="true" />
            </template>
            Add
          </NeButton>
        </div>

        <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Neighbour Table">
          <NeTableHead>
            <NeTableHeadCell>Neighbor IP</NeTableHeadCell>
            <NeTableHeadCell>Neighbor AS</NeTableHeadCell>
            <NeTableHeadCell>Actions</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in newNeighbours" :key="`new-${index}`">
              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbour IP" /> -->
                <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbor IP"
                  @input="(e: Event) => validateIp(e, index, 'neighbor_ip')" />
              </NeTableCell>
              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.neighbor_as" placeholder="Route AS" /> -->
                <NeTextInput v-model.trim="item.neighbor_as" placeholder="Neighbor As"
                  @input="(e: Event) => validateIp(e, index, 'neighbor_as')" />
              </NeTableCell>
              <NeTableCell>
                <NeButton size="sm" class="mt-5" @click=deleteNeighbour(index)>
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" aria-hidden="true" />
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
              <font-awesome-icon :icon="['fas', 'plus']" class="w-4 h-4" aria-hidden="true" />
            </template>
            Add
          </NeButton>
        </div>

        <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Network Table">
          <NeTableHead>
            <NeTableHeadCell>Network</NeTableHeadCell>
            <NeTableHeadCell>Actions</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in newNetwork" :key="`new-${index}`">
              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.network" placeholder="Network" /> -->
                <NeTextInput v-model.trim="item.network" placeholder="Network"
                  @input="(e: Event) => validateNewNetwork(e, index, 'network')" />
              </NeTableCell>
              <NeTableCell>
                <NeButton size="sm" @click="deleteNetwork(index)">
                  <font-awesome-icon :icon="['fas', 'trash']" class="w-4 h-4" aria-hidden="true" />
                </NeButton>
                <!-- <NeButton kind="danger" size="sm" @click="deleteNetwork(index)">Delete</NeButton> -->
              </NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>
      </div>
    </div>
  </template>
  <!-- Save Button -->
  <div class="flex justify-end mt-4">
    <!-- <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
      Save
    </NeButton> -->
    <div class="flex  flex-col w-[90px]">
      <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
        @click.prevent="saveNetworkConfig()">
        <template #prefix>
          <FontAwesomeIcon :icon="faSave" />
        </template>
        {{ t('common.save') }}
      </NeButton>
    </div>
  </div>
</template>
