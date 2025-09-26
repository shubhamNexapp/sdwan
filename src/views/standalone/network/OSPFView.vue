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
  NeTextInput,
} from "@nethesis/vue-components";
import { onMounted, ref, watch } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { useNotificationsStore } from "@/stores/notifications";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

import { useI18n } from "vue-i18n";

const { t } = useI18n();

const loading = ref({ saveRule: false });

const notificationsStore = useNotificationsStore();

const service = ref(false);
const redistributeConnect = ref(false);
const redistributeStatic = ref(false);
const redistributeKernel = ref(false);

const interfaceOptions = ref<{ label: string; id: string }[]>([]);

const selectedInterface = ref("");

let apiResponse = ref();
const newNeighbours = ref<{ neighbor_ip: string }[]>([]);
const newNetwork = ref<{ network: string; area_number: string }[]>([]);
const interfaceNew = ref<
  { interface_name: string; cost: string; network_type: string }[]
>([]);
watch(
  () => apiResponse.value,
  (newValue) => {
    if (newValue) {
      service.value = newValue.service === "enable";
      redistributeConnect.value = newValue.rdb_connected === "enable";
      redistributeStatic.value = newValue.rdb_static === "enable";
      redistributeKernel.value = newValue.rdb_kernel === "enable";
      newNeighbours.value = newValue.neighbor || [];
      newNetwork.value = newValue.network_conf || [];
      // interfaceNew.value = newValue.interface_conf || [];

      // Ensure interface values are mapped correctly
      interfaceNew.value =
        newValue.interface_conf?.map((item: any) => ({
          interface_name: item.interface_name || "",
          cost: item.cost || "",
          network_type: item.network_type || "",
        })) || [];

      const uniqueIfnames = [
        ...new Set(
          (newValue.up_interface || []).map((item: any) => item.ifname)
        ),
      ];

      const interfaces: { ifname: string }[] = newValue?.up_interface || [];

      interfaceOptions.value = interfaces.map((iface) => ({
        label: iface.ifname,
        id: iface.ifname,
      }));

      // interfaceOptions.value = uniqueIfnames.map((ifname) => ({
      //   label: ifname,
      //   id: ifname,
      // }));
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
      method: "get-config",
      payload: {},
    });
    if (response.data.code === 200) {
      apiResponse.value = response.data.data;
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

const addNeighbour = () => {
  newNeighbours.value.push({ neighbor_ip: "" });
};

const addNetwork = () => {
  newNetwork.value.push({ network: "", area_number: "" });
};

const addInterFace = () => {
  interfaceNew.value.push({
    interface_name: "br-lan", // Default to 'br-lan'
    cost: "",
    network_type: "broadcast", // Default to 'broadcast'
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
        interface_conf: interfaceNew.value,
      },
    };

    console.log("payload=======", payload);

    await axios.post(`${getSDControllerApiEndpoint()}/ospf`, payload);
    getLists(); // Refresh list after saving
    notificationsStore.createNotification({
      title: "Success",
      description: "Configuration saved successfully.",
      kind: "success",
    });
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

const validateIp = (event: Event, index: number, field: keyof Neighbour) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, "");
  newNeighbours.value[index][field] = input.value;
};

const validateIpNetwork = (
  event: Event,
  index: number,
  field: keyof Network
) => {
  const input = event.target as HTMLInputElement;
  // Apply different validation rules based on the field
  if (field === "network") {
    input.value = input.value.replace(/[^0-9./]/g, "");
  } else if (field === "area_number") {
    // Allow only digits
    let value = input.value.replace(/[^0-9]/g, "");

    // Convert to number and clamp between 0-65535
    const num = Math.min(65535, Math.max(0, Number(value)));
    input.value = isNaN(num) ? "" : num.toString();
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
  let value = input.value.replace(/[^0-9]/g, "");

  // Convert to number and clamp between 0-65535
  const num = Math.min(65535, Math.max(0, Number(value)));
  input.value = isNaN(num) ? "" : num.toString();
  interfaceNew.value[index][field] = input.value;
};
</script>

<template>
  <NeHeading tag="h3" class="mb-4">OSPF</NeHeading>
  <p
    class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"
  >
    {{
      t(
        "Configure OSPF service settings, including redistribution of connected, static, and kernel routes, and manage neighbors, networks, and interfaces."
      )
    }}
  </p>
  <!-- <NeToggle v-model="service" label="OSPF Service" /> -->
  <NeToggle
    v-model="service"
    :label="service ? 'Enable' : 'Disable'"
    :topLabel="'OSPF Service'"
  />

  <template v-if="service">
    <div class="flex flex-col gap-y-6">
      <div>
        <div class="mb-4 flex flex-col items-start">
          <div class="mt-4 flex w-full flex-col gap-1">
            <NeToggle
              v-model="redistributeConnect"
              :label="redistributeConnect ? 'Enable' : 'Disable'"
              :topLabel="'Redisribute Connect'"
            />
            <NeToggle
              v-model="redistributeStatic"
              :label="redistributeStatic ? 'Enable' : 'Disable'"
              :topLabel="'Redisribute Static'"
            />
            <NeToggle
              v-model="redistributeKernel"
              :label="redistributeKernel ? 'Enable' : 'Disable'"
              :topLabel="'Redisribute Kernel'"
            />

            <!-- <NeToggle v-model="redistributeConnect" label="Redisribute Connect" />
            <NeToggle v-model="redistributeStatic" label="Redisribute Static" />
            <NeToggle v-model="redistributeKernel" label="Redisribute Kernel" /> -->
          </div>
        </div>

        <!-- Neighbours Table -->
        <div class="mt-4 flex flex-row items-center justify-between">
          <p class="max-w-2xl font-bold text-black dark:text-gray-400">
            Neighbour
          </p>
          <NeButton kind="primary" size="lg" @click="addNeighbour">
            <template>
              <font-awesome-icon
                :icon="['fas', 'plus']"
                class="h-4 w-4"
                aria-hidden="true"
              />
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
            <NeTableRow
              v-for="(item, index) in newNeighbours"
              :key="`new-${index}`"
            >
              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.neighbor_ip" placeholder="Neighbour" /> -->
                <NeTextInput
                  v-model.trim="item.neighbor_ip"
                  placeholder="Neighbour"
                  @input="(e: Event) => validateIp(e, index, 'neighbor_ip')"
                />
              </NeTableCell>
              <NeTableCell>
                <NeButton
                  size="sm"
                  class="mt-5"
                  @click="deleteNeighbour(index)"
                >
                  <font-awesome-icon
                    :icon="['fas', 'trash']"
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                </NeButton>
              </NeTableCell>
              <!-- <NeButton kind="danger" size="sm" @click="deleteNeighbour(index)">Delete</NeButton> -->
            </NeTableRow>
          </NeTableBody>
        </NeTable>

        <!-- Networks Table -->
        <div class="mt-6 flex flex-row items-center justify-between">
          <p class="max-w-2xl font-bold text-black dark:text-gray-400">
            Network
          </p>
          <NeButton kind="primary" size="lg" @click="addNetwork">
            <template>
              <font-awesome-icon
                :icon="['fas', 'plus']"
                class="h-4 w-4"
                aria-hidden="true"
              />
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
            <NeTableRow
              v-for="(item, index) in newNetwork"
              :key="`new-${index}`"
            >
              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.network" placeholder="Network" /> -->
                <NeTextInput
                  v-model.trim="item.network"
                  placeholder="Network"
                  @input="(e: Event) => validateIpNetwork(e, index, 'network')"
                />
              </NeTableCell>
              <NeTableCell>
                <NeTextInput
                  v-model.trim="item.area_number"
                  placeholder="Area Number"
                  @input="(e: Event) => validateIpNetwork(e, index, 'area_number')"
                />
              </NeTableCell>
              <NeTableCell>
                <NeButton size="sm" @click="deleteNetwork(index)">
                  <font-awesome-icon
                    :icon="['fas', 'trash']"
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                </NeButton>
                <!-- <NeButton kind="danger" size="sm" @click="deleteNetwork(index)">Delete</NeButton> -->
              </NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>

        <!-- Interface Table -->
        <div class="mt-6 flex flex-row items-center justify-between">
          <p class="max-w-2xl font-bold text-black dark:text-gray-400">
            Interface
          </p>
          <NeButton kind="primary" size="lg" @click="addInterFace">
            <template>
              <font-awesome-icon
                :icon="['fas', 'plus']"
                class="h-4 w-4"
                aria-hidden="true"
              />
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
            <NeTableRow
              v-for="(item, index) in interfaceNew"
              :key="`new-${index}`"
            >
              <NeTableCell>
                <select v-model="item.interface_name" id="interface">
                  <option disabled value="">-- Please select --</option>
                  <option
                    v-for="option in interfaceOptions"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </NeTableCell>
              <!-- <NeCombobox
                multiple
                v-model="item.interface_name"
                :options="interfaceOptions"
                value-key="id"
                label-key="label"
                :label="$t('Interface Name')"
                class="grow"
                :noResultsLabel="$t('ne_combobox.no_results')"
                :limitedOptionsLabel="$t('ne_combobox.limited_options_label')"
                :noOptionsLabel="$t('ne_combobox.no_options_label')"
                :selected-label="$t('ne_combobox.selected')"
                :user-input-label="$t('ne_combobox.user_input_label')"
                :optionalLabel="$t('common.optional')"
              /> -->

              <NeTableCell>
                <!-- <NeTextInput v-model.trim="item.cost" placeholder="Cost" /> -->
                <NeTextInput
                  v-model.trim="item.cost"
                  placeholder="Cost"
                  @input="(e: Event) => validateInterfaceNew(e, index, 'cost')"
                />
              </NeTableCell>
              <NeTableCell>
                <select v-model="item.network_type">
                  <option value="broadcast">Broadcast</option>
                  <option value="non-broadcast">Non-Broadcast</option>
                  <option value="point-to-multipoint">
                    Point-to-Multipoint
                  </option>
                  <option value="point-to-point">Point-to-Point</option>
                </select>
              </NeTableCell>
              <NeTableCell>
                <NeButton size="sm" @click="deleteInterface(index)">
                  <font-awesome-icon
                    :icon="['fas', 'trash']"
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
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
    <!-- <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
      Save
    </NeButton> -->
      <NeButton
        class="ml-1"
        :disabled="loading.saveRule"
        :loading="loading.saveRule"
        kind="primary"
        size="lg"
        @click.prevent="saveNetworkConfig()"
      >
                     <FontAwesomeIcon :icon="['fas', 'floppy-disk']" aria-hidden="true" class="mr-2" />

        {{ t("common.save") }}
      </NeButton>
  </div>
</template>
