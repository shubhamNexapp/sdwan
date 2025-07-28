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
} from "@nethesis/vue-components";
import { useUciPendingChangesStore } from "@/stores/standalone/uciPendingChanges";
import { onMounted, onUnmounted, ref } from "vue";
import { ubusCall } from "@/lib/standalone/ubus";
import DeleteTunnelModal from "./DeleteRule.vue";
import ICMPDrawer from "@/components/standalone/ICMP/icmp_drawer.vue";
import EditRule from "./EditRule.vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import AddRuleDrawer from "./AddRule.vue";

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

const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});

function openCreateEditDrawer(itemToEdit: IpsecTunnel | null) {
  selectedTunnel.value = itemToEdit;
  showCreateEditDrawer.value = true;
}

const selectedTunnelName = ref<string | null>(null);

function openDeleteModal(tunnelName: string) {
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
  await uciChangesStore.getChanges();
}

onMounted(() => {
  getLists();
});

let apiResponse = ref();
const getLists = async () => {
  try {
    loading.value = true;
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/performance_sla`,
      {
        method: "get-config",
        payload: {},
      }
    );

    if (response.data.code === 200) {
      loading.value = false;
      apiResponse.value = response.data.data; // Store API response
    }
  } catch (err) {
    loading.value = false;
  }
  loading.value = false;
};

function handleFectLists() {
  //   fetchTunnels();
  getLists();
}
</script>

<template>
  <div class="flex flex-col">
    <div class="space-y-6">
      <NeInlineNotification
        kind="error"
        :title="error.notificationTitle"
        :description="error.notificationDescription"
        v-if="error.notificationTitle"
      >
        <template v-if="error.notificationDetails">
          {{ error.notificationDetails }}
        </template>
      </NeInlineNotification>

      <NeSkeleton v-if="loading" :lines="8" size="lg" />

      <template v-else>
        <!-- Show "Add WireGuard Tunnel" button if dummyData is empty -->

        <NeButton kind="primary" @click="openCreateEditDrawer(null)">
          <template>
            <font-awesome-icon
              :icon="['fas', 'circle-plus']"
              class="h-4 w-4"
              aria-hidden="true"
            />
          </template>
          {{ t("standalone.openvpn_warrior.add") }}
        </NeButton>
        <!-- Show table if apiresponse has values -->
        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>#</NeTableHeadCell>
            <NeTableHeadCell>Name</NeTableHeadCell>
            <NeTableHeadCell>Source</NeTableHeadCell>
            <NeTableHeadCell>Destination</NeTableHeadCell>
            <NeTableHeadCell>Protocol</NeTableHeadCell>
            <NeTableHeadCell>Port</NeTableHeadCell>
            <NeTableHeadCell>Outgoing Mode</NeTableHeadCell>
            <NeTableHeadCell>Outgoing Interface</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in apiResponse.rules" :key="index">
              <NeTableCell>{{ index + 1 }}</NeTableCell>
              <NeTableCell>{{ item.rule_name }}</NeTableCell>
              <NeTableCell>{{ item.rule_source }}</NeTableCell>
              <NeTableCell>{{ item.rule_destination }}</NeTableCell>
              <NeTableCell>{{ item.rule_protocol }}</NeTableCell>
              <NeTableCell>{{ item.port }}</NeTableCell>
              <NeTableCell>{{ item.outgoing_mode }}</NeTableCell>
              <NeTableCell>{{ item.manual_interface }}</NeTableCell>
              <NeTableCell :data-label="t('common.actions')">
                <div class="-ml-2.5 flex gap-2 xl:ml-0 xl:justify-end">
                  <NeButton
                    kind="tertiary"
                    size="lg"
                    :disabled="item.readonly"
                    @click="openEditModal(item)"
                  >
                    {{ t("common.edit") }}
                  </NeButton>
                  <NeButton
                    kind="tertiary"
                    size="lg"
                    :disabled="item.readonly"
                    @click="openDeleteModal(item.rule_name)"
                  >
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

  <DeleteTunnelModal
    :visible="showDeleteModal"
    :itemToDelete="selectedTunnelName"
    @close="showDeleteModal = false"
    @tunnel-deleted="handleFectLists"
  />
  <AddRuleDrawer
    @tunnel-added="handleFectLists"
    :item-to-edit="selectedTunnel"
    @close="closeModalsAndDrawers"
    :rule-type="'forward'"
    :known-tags="[]"
    @add-edit-tunnel="reloadTunnels"
    :is-shown="showCreateEditDrawer"
  />
  <EditRule
    :isShown="showEditModals"
    :itemToEdit="selectedTunnels"
    @close="showEditModals = false"
  />
</template>
