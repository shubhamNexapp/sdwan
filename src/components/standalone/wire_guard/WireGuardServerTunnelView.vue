<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {
  NeHeading,
  NeButton,
  NeInlineNotification,
  NeSkeleton,
  getAxiosErrorMessage,
  NeTable,
  NeTableHead,
  NeTableHeadCell,
  NeTableBody,
  NeTableRow,
  NeTableCell,
  NeTextInput,
  NeTooltip,
  NeToggle,
} from "@nethesis/vue-components";
import { useUciPendingChangesStore } from "@/stores/standalone/uciPendingChanges";
import { onMounted, onUnmounted, ref } from "vue";
import { ubusCall } from "@/lib/standalone/ubus";
import ServerDeleteModal from "@/components/standalone/wire_guard/ServerDeleteModal.vue";
import AddWireGuarSereverTunnel from "@/components/standalone/wire_guard/AddWireGuardServerTunnel.vue";
import ICMPEdit from "@/components/standalone/ICMP/icmp_edit.vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useNotificationsStore } from "@/stores/notifications";

export type IpsecTunnel = {
  id: string;
  name: string;
  local: string[];
  remote: string[];
  enabled: "0" | "1";
  connected: boolean;
  tunnelName: string;
};

const { t } = useI18n();
const uciChangesStore = useUciPendingChangesStore();

const RELOAD_INTERVAL = 10000;
const loading = ref(true);
const tunnels = ref([]);
const selectedTunnel = ref<IpsecTunnel | null>(null);
const showCreateEditDrawer = ref(false);
const showDeleteModal = ref(false);
const fetchTunnelsIntervalId = ref(0);

const service = ref(false);
const address = ref("");
const listenPort = ref("");
const mtu = ref("");

const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});

// async function fetchTunnels(setLoading: boolean = true) {
//   try {
//     if (setLoading) {
//       loading.value = true
//     }
//     tunnels.value = (await ubusCall('ns.ipsectunnel', 'list-tunnels')).data.tunnels
//     loading.value = false
//   } catch (err: any) {
//     error.value.notificationTitle = t('error.cannot_retrieve_ipsec_tunnels')
//     error.value.notificationDescription = t(getAxiosErrorMessage(err))
//     error.value.notificationDetails = err.toString()
//   } finally {
//     if (setLoading) {
//       loading.value = false
//     }
//   }
// }

function openCreateEditDrawer(itemToEdit: IpsecTunnel | null) {
  selectedTunnel.value = itemToEdit;
  showCreateEditDrawer.value = true;
}

const selectedTunnelName = ref<string | null>(null);

function openDeleteModal(tunnelName: string) {
  console.log("tunnelName=======",tunnelName)
  selectedTunnelName.value = tunnelName;
  showDeleteModal.value = true;
}

const selectedTunnels = ref();
const showEditModals = ref(false);

function openEditModal(tunnel: object) {
  selectedTunnels.value = tunnel;
  showEditModals.value = true;
}

function closeModalsAndDrawers() {
  selectedTunnel.value = null;
  showDeleteModal.value = false;
  showCreateEditDrawer.value = false;
}

function cleanError() {
  error.value = {
    notificationTitle: "",
    notificationDescription: "",
    notificationDetails: "",
  };
}

async function reloadTunnels() {
  cleanError();
  // await fetchTunnels()
  await uciChangesStore.getChanges();
}

onMounted(() => {
  // fetchTunnels()
  getLists();
  // periodically reload data
  // fetchTunnelsIntervalId.value = setInterval(() => fetchTunnels(false), RELOAD_INTERVAL)
});

// onUnmounted(() => {
//   if (fetchTunnelsIntervalId.value) {
//     clearInterval(fetchTunnelsIntervalId.value)
//   }
// })

let apiResponse = ref();
const getLists = async () => {
  try {
    loading.value = true;
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/wireguard_server`,
      {
        method: "get-config",
        payload: {},
      }
    );

    if (response.data.code === 200) {
      loading.value = false;
      const data = response.data.data;

      // Set form fields
      service.value = data.service === "enable";
      address.value = data.address || "";
      listenPort.value = data.listen_port || "";
      mtu.value = data.mtu || "";

      apiResponse.value = [data]; // If you still need this
    }
  } catch (err) {
    loading.value = false;
  }
  loading.value = false;
};

function handleFectLists() {
  // fetchTunnels();
  getLists();
}

function getCellClasses(item: IpsecTunnel) {
  return item.enabled === "0" ? ["text-gray-400", "dark:text-gray-700"] : [];
}

const notificationsStore = useNotificationsStore();

const errorBag = ref<{ [key: string]: string }>({});

// Form validation function
const validate = () => {
  errorBag.value = {};

  // Validate address (string, max length 32, not empty)
  if (!address.value || address.value.trim() === "") {
    errorBag.value.address = "Address is required.";
  } else if (address.value.length > 32) {
    errorBag.value.address = "Address must not exceed 32 characters.";
  }

  // Validate listenPort (number between 1 and 65536)
  const port = Number(listenPort.value);
  if (!listenPort.value) {
    errorBag.value.listenPort = "Listen Port is required.";
  } else if (isNaN(port) || port < 1 || port > 65536) {
    errorBag.value.listenPort =
      "Listen Port must be a number between 1 and 65536.";
  }

  // Validate MTU (number between 1 and 65535)
  const mtuVal = Number(mtu.value);
  if (!mtu.value) {
    errorBag.value.mtu = "MTU is required.";
  } else if (isNaN(mtuVal) || mtuVal < 1 || mtuVal > 65535) {
    errorBag.value.mtu = "MTU must be a number between 1 and 65535.";
  }

  return Object.keys(errorBag.value).length === 0;
};

const saveRule = async () => {
  if (!validate()) return;

  try {
    // Collect entries into an array
    const payload = {
      service: service.value ? "enable" : "disable",
      address: address.value,
      listen_port: listenPort.value,
      mtu: mtu.value,
    };

    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/wireguard_server`,
      {
        method: "set-config",
        payload,
      }
    );

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: "Configuration saved successfully.",
        kind: "success",
      });
      getLists();
    }
  } catch (err) {
    console.error("Error saving rule:", getAxiosErrorMessage(err));
  }
};
</script>

<template>
  <div class="mb-4 space-y-6">
    <NeToggle
      v-model="service"
      :label="service ? 'Enable' : 'Disable'"
      :topLabel="'Service'"
    />

    <template v-if="service">
      <NeTextInput
        v-model.trim="address"
        :label="t('Address')"
        :placeholder="t('Enter Address')"
        :invalidMessage="errorBag.address"
      >
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t("Enter Address") }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>
      <NeTextInput
        v-model.trim="listenPort"
        :label="t('Listen Port')"
        :placeholder="t('Enter Listen Port')"
        :invalidMessage="errorBag.listenPort"
      >
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t("Enter listen port") }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>
      <NeTextInput
        v-model.trim="mtu"
        :label="t('MTU')"
        :placeholder="t('Enter MTU')"
        :invalidMessage="errorBag.mtu"
      >
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t("Enter MTU") }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>
    </template>

    <div class="flex w-[90px] flex-col">
      <NeButton
        class="ml-1"
        kind="primary"
        size="lg"
        @click.prevent="saveRule()"
      >
        <template #prefix>
          <FontAwesomeIcon :icon="faSave" />
        </template>
        {{ t("common.save") }}
      </NeButton>
    </div>
  </div>

  <hr />
  <hr />
  <hr />
  <hr />

  <div class="mt-4 flex flex-col">
    <div class="space-y-6">
      <NeInlineNotification
        kind="error"
        :title="error.notificationTitle"
        :description="error.notificationDescription"
        v-if="error.notificationTitle"
      >
        <template #details v-if="error.notificationDetails">
          {{ error.notificationDetails }}
        </template>
      </NeInlineNotification>

      <NeSkeleton v-if="loading" :lines="8" size="lg" />

      <template v-else>
        <!-- Show "Add WireGuard Tunnel" button if dummyData is empty -->

        <NeButton kind="primary" @click="openCreateEditDrawer(null)">
          <template #prefix>
            <font-awesome-icon
              :icon="['fas', 'circle-plus']"
              class="h-4 w-4"
              aria-hidden="true"
            />
          </template>
          {{ t("Add Server Tunnel") }}
        </NeButton>
        <!-- Show table if apiresponse has values -->
        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>#</NeTableHeadCell>
            <NeTableHeadCell>Name</NeTableHeadCell>
            <NeTableHeadCell>Public Key</NeTableHeadCell>
            <NeTableHeadCell>Allowed IPs</NeTableHeadCell>
            <NeTableHeadCell>Keep Alive</NeTableHeadCell>
            <NeTableHeadCell>Status</NeTableHeadCell>
            <NeTableHeadCell>Service</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow
              v-for="(item, index) in apiResponse[0].client"
              :key="index"
            >
              <NeTableCell>{{ index + 1 }}</NeTableCell>
              <NeTableCell>{{ item.name }}</NeTableCell>
              <NeTableCell>{{ item.public_key }}</NeTableCell>
              <NeTableCell>{{ item.allowed_ips }}</NeTableCell>
              <NeTableCell>{{ item.keepalive }}</NeTableCell>
              <NeTableCell>{{ item.status }}</NeTableCell>
              <NeTableCell>
                <div
                  :class="[
                    'flex',
                    'flex-row',
                    'items-center',
                    ...getCellClasses(item),
                  ]"
                >
                  <font-awesome-icon
                    :icon="[
                      'fas',
                      item.peer_service === 'enabled'
                        ? 'circle-check'
                        : 'circle-xmark',
                    ]"
                    class="mr-2 h-5 w-5"
                    aria-hidden="true"
                  />
                  <p>
                    {{
                      item.peer_service === "enabled"
                        ? t("Enabled")
                        : t("Disabled")
                    }}
                  </p>
                </div>
              </NeTableCell>
              <NeTableCell :data-label="t('common.actions')">
                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                  <!-- <NeButton kind="tertiary" size="lg" :disabled="item.readonly" @click="openEditModal(item)">
                    <template #prefix>
                      <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    {{ t('common.edit') }}
                  </NeButton> -->
                  <NeButton
                    kind="tertiary"
                    size="lg"
                    :disabled="item.readonly"
                    @click="openDeleteModal(item.name)"
                  >
                    <template #prefix>
                      <font-awesome-icon
                        :icon="['fas', 'trash']"
                        class="h-4 w-4"
                        aria-hidden="true"
                      />
                    </template>
                    {{ t("common.delete") }}
                  </NeButton>
                </div>
              </NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>
      </template>
    </div>
  </div>

  <ServerDeleteModal
    :visible="showDeleteModal"
    :itemToDelete="selectedTunnelName"
    @close="showDeleteModal = false"
    @tunnel-deleted="handleFectLists"
  />
  <AddWireGuarSereverTunnel
    @tunnel-added="handleFectLists"
    :item-to-edit="selectedTunnel"
    @close="closeModalsAndDrawers"
    :rule-type="'forward'"
    :known-tags="[]"
    @add-edit-tunnel="reloadTunnels"
    :is-shown="showCreateEditDrawer"
  />
</template>
