<!-- DpiExceptions.vue -->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import {
  NeInlineNotification,
  NeSkeleton,
  NeButton,
  NeEmptyState,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { ubusCall } from "@/lib/standalone/ubus";
import { useUciPendingChangesStore } from "@/stores/standalone/uciPendingChanges";
import DpiExceptionCard from "./DpiExceptionCard.vue";
import CreateOrDeleteDpiExceptionDrawer from "./CreateOrDeleteDpiExceptionDrawer.vue";
import CreateOrEditDpiGroupDrawer from "./CreateOrEditDpiGroupDrawer.vue";
import DeleteDpiExceptionModal from "./DeleteDpiExceptionModal.vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import DpiGroupCard from "./DpiGroupCard.vue";

export type DpiException = {
  "config-name": string;
  exemption_name: string;
  criteria: string;
  enabled: boolean;
  description : string
};

export type DpiGroup = {
  group_name: string;
  ip: { network: string }[]; // ✅ array of objects
  enabled: boolean;
};

type ListInterfacesResponse = {
  data: {
    [name: string]: {
      ns_binding: number
    }
  }
}

const { t } = useI18n();
const uciChangesStore = useUciPendingChangesStore();

const loading = ref(false);
const exceptions = ref<DpiException[]>([]);
const selectedException = ref<DpiException | null>(null);
const showCreateEditDrawer = ref(false);
const showDeleteModal = ref(false);

const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});

// Open drawer for add/edit
function openCreateEditDrawer(itemToEdit: DpiException | null) {
  selectedException.value = itemToEdit;
  showCreateEditDrawer.value = true;
}

// Open delete modal
function openDeleteModal(itemToDelete: DpiException) {
  selectedException.value = itemToDelete;
  showDeleteModal.value = true;
}

// Fetch list from API
async function fetchDpiExceptions() {
  try {
    loading.value = true;
    const res = await ubusCall("ns.dpi", "list-exemptions");
    exceptions.value = res.data.values;
  } catch (err: any) {
    error.value.notificationTitle = t("error.cannot_retrieve_dpi_exceptions");
    error.value.notificationDescription = t(getAxiosErrorMessage(err));
    error.value.notificationDetails = err.toString();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  getLists();
  getGroupData();
});

const exceptionsAPIDATA = ref<DpiException[]>([]);
const groupData = ref<DpiGroup[]>([]);
async function fetchStatus() {
  try {
    loading.value = true;

    const response = await ubusCall("ns.dpi", "list-exemptions");
    // Response shape: response.data.values = []
    exceptions.value = response.data.values || [];
  } catch (err: any) {
    error.value = err.message || "Failed to fetch exceptions";
  } finally {
    loading.value = false;
  }
}

onMounted(fetchStatus);

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-exemption",
      payload: {},
    });
    // Map API data to DpiException[] type
    const apiExceptions = response.data?.data?.exemption || [];
    exceptionsAPIDATA.value = apiExceptions.map((item: any) => ({
      exemption_name: item.exemption_name,
      criteria: item.criteria,
      enabled: item.enabled === "1",
    }));
  } catch (err) { }
};

const getGroupData = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-group",
      payload: {},
    });
    // Map API data to DpiGroup[] type
    const apiGroups = response.data?.data || [];
    groupData.value = apiGroups.map((item: any) => ({
      group_name: item.group_name,
      ip: item.ip,
      enabled: item.enabled === "1",
    }));
  } catch (err) { }
};

// Reload list
async function reloadExceptions() {
  await fetchDpiExceptions();
  await uciChangesStore.getChanges();
}

onMounted(fetchDpiExceptions);

const groups = ref<DpiGroup[]>([]);
const selectedGroup = ref<DpiGroup | null>(null);
const showCreateEditDrawerGroup = ref(false);

onMounted(() => {
  getGroups();
});

// Fetch groups from API
const getGroups = async () => {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-group",
      payload: {},
    });

    console.log("Response from get-group:", response.data);

    const apiGroups = response.data?.data || []; // <-- FIXED
    groups.value = apiGroups.map((item: any) => ({
      group_name: item.group_name,
      ip: item.ip,
    }));
  } catch (err) {
    error.value.notificationTitle = t("error.cannot_retrieve_dpi_groups");
    error.value.notificationDescription = t(getAxiosErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

function openCreateEditDrawerGroup(group: DpiGroup | null) {
  selectedGroup.value = group;
  showCreateEditDrawerGroup.value = true;
}

async function deleteGroup(group: DpiGroup) {
  await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
    method: "delete-group",
    payload: { group_name: group.group_name },
  });
  getGroupData();
}

console.log("Groups:====", groups);
</script>

<template>
  <div class="flex flex-col gap-y-6">
    <!-- Top Bar -->
    <div class="flex flex-row items-center justify-between">
      <p class="max-w-2xl text-sm text-gray-500">
        {{ t("standalone.dpi.exceptions_description") }}
      </p>
      <template v-if="exceptions.length > 0">
        <NeButton kind="secondary" @click="openCreateEditDrawer(null)">
          <font-awesome-icon :icon="['fas', 'circle-plus']" class="mr-2 h-4 w-4" />
          {{ t("standalone.dpi.add_exception") }}
        </NeButton>
        <!-- <NeButton kind="secondary" @click="openCreateEditDrawerGroup(null)">
          <font-awesome-icon :icon="['fas', 'circle-plus']" class="mr-2 h-4 w-4" />
          {{ t("Add Group") }}
        </NeButton> -->
      </template>

      
    </div>

    <!-- Error -->
    <NeInlineNotification v-if="error.notificationTitle" kind="error" :title="error.notificationTitle"
      :description="error.notificationDescription">
      <template v-if="error.notificationDetails">
        {{ error.notificationDetails }}
      </template>
    </NeInlineNotification>

    <!-- Loading -->
    <NeSkeleton v-if="loading" :lines="10" />

    <!-- Content -->
    <template v-else-if="!error.notificationTitle">
      <!-- Empty state -->
      <NeEmptyState v-if="exceptions.length === 0" :title="t('standalone.dpi.no_exception_found')"
        :icon="['fas', 'circle-info']">
        <NeButton kind="primary" @click="openCreateEditDrawer(null)">
          <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4 mr-2" />
          {{ t("standalone.dpi.add_exception") }}
        </NeButton>
      </NeEmptyState>

      <!-- Cards -->
      <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
        <DpiExceptionCard v-for="(exception, index) in exceptions" :key="index" :exception="exception"
          @delete="openDeleteModal" @edit="openCreateEditDrawer" />

        <DpiGroupCard v-for="(group, index) in groupData" :key="index" :group="group" @edit="openCreateEditDrawerGroup"
          @delete="deleteGroup" />
        <!-- <DpiGroupCard
          v-for="(group, index) in groupData"
          :key="index"
          :group="group"
          @edit="openCreateEditDrawer"
        /> -->
      </div>
    </template>
  </div>

  <!-- Delete Modal -->
  <DeleteDpiExceptionModal :visible="showDeleteModal" :item-to-delete="selectedException"
    @close="showDeleteModal = false" @dpi-exception-deleted="reloadExceptions" />

  <!-- Add/Edit Drawer -->
  <CreateOrDeleteDpiExceptionDrawer :is-shown="showCreateEditDrawer" :item-to-edit="selectedException"
    @close="showCreateEditDrawer = false" @add-edit-exception="reloadExceptions" />

  <CreateOrEditDpiGroupDrawer :is-shown="showCreateEditDrawerGroup" :item-to-edit="selectedGroup"
    @close="showCreateEditDrawerGroup = false" @save="getGroupData" />
</template>
