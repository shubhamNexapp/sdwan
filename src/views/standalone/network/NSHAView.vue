<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {
  NeHeading,
  NeButton,
  NeInlineNotification,
  NeSkeleton,
  NeTable,
  NeTableHead,
  NeTableHeadCell,
  NeTableBody,
  NeTableRow,
  NeTableCell,
} from "@nethesis/vue-components";
import { onMounted, ref, nextTick } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import NSHADrawer from "@/components/standalone/ns_ha/NSHADrawer.vue";

const { t } = useI18n();

const loading = ref(true);
const apiResponse = ref<any | null>(null);

const showCreateEditDrawer = ref(false);
const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});

// open drawer
function openCreateEditDrawer() {
  showCreateEditDrawer.value = true;
}

function closeModalsAndDrawers() {
  showCreateEditDrawer.value = false;
}

onMounted(() => {
  getConfig();
});

// Fetch ns_ha config
const getConfig = async () => {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ns_ha`, {
      method: "get-config",
      payload: {},
    });

    if (response.data.code === 200) {
      apiResponse.value = response.data.data;
    }
  } catch (err: any) {
    error.value.notificationTitle = "Error";
    error.value.notificationDescription = err.toString();
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">{{ t("NS HA") }}</NeHeading>
    </div>
    <p
      class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"
    >
      {{
        t("Configure High Availability settings for primary and backup nodes.")
      }}
    </p>

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
        <NeButton kind="primary" @click="openCreateEditDrawer">
          <template>
            <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4" />
          </template>
          {{ t("Add") }}
        </NeButton>

        <NeTable v-if="apiResponse" cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>Service</NeTableHeadCell>
            <NeTableHeadCell>Role</NeTableHeadCell>
            <NeTableHeadCell>Primary Node</NeTableHeadCell>
            <NeTableHeadCell>Backup Node</NeTableHeadCell>
            <NeTableHeadCell>Virtual IP</NeTableHeadCell>
            <NeTableHeadCell>WAN Iface</NeTableHeadCell>
            <NeTableHeadCell>WAN Virtual IP</NeTableHeadCell>
            <NeTableHeadCell>WAN Gateway</NeTableHeadCell>
            <NeTableHeadCell>Public Key</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow>
              <NeTableCell>{{ apiResponse.service }}</NeTableCell>
              <NeTableCell>{{ apiResponse.role }}</NeTableCell>
              <NeTableCell>{{ apiResponse.primary_node_ip }}</NeTableCell>
              <NeTableCell>{{ apiResponse.backup_node_ip }}</NeTableCell>
              <NeTableCell>{{ apiResponse.virtual_ip }}</NeTableCell>
              <NeTableCell>{{ apiResponse.wan_ifname }}</NeTableCell>
              <NeTableCell>{{ apiResponse.wan_virtual_ip }}</NeTableCell>
              <NeTableCell>{{ apiResponse.wan_gateway }}</NeTableCell>
              <NeTableCell>{{ apiResponse.pubbkey }}</NeTableCell>
            </NeTableRow>
          </NeTableBody>
        </NeTable>
      </template>
    </div>
  </div>

  <NSHADrawer
    :is-shown="showCreateEditDrawer"
    :config="apiResponse"
    @close="closeModalsAndDrawers"
    @save="getConfig"
  />
</template>
