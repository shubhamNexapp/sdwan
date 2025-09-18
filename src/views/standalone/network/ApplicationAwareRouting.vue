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
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";

import DeleteTunnelModal from "@/components/standalone/ApplicationAwareRoutingComponents/ApplicationDeleteModal.vue";
import ApplicationDrawer from "@/components/standalone/ApplicationAwareRoutingComponents/ApplicationDrawer.vue";

export type VRFRule = {
  rule_name: string;
  service: string;
  app_name: string;
  interface: string;
  status: string;
  gateway: string
};

const { t } = useI18n();
const loading = ref(true);
const rules = ref<VRFRule[]>([]);
const upInterfaces = ref<{ label: string; id: string }[]>([]);

const selectedRule = ref<VRFRule | null>(null);
const showDrawer = ref(false);
const showDeleteModal = ref(false);
const selectedRuleName = ref<string | null>(null);

const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});

function openDrawer(rule: VRFRule | null) {
  selectedRule.value = rule;
  showDrawer.value = true;
}

async function openDeleteModal(ruleName: string) {
  selectedRuleName.value = ruleName;
  await nextTick();
  showDeleteModal.value = true;
}

function closeModalsAndDrawers() {
  selectedRule.value = null;
  showDrawer.value = false;
  showDeleteModal.value = false;
}

onMounted(() => {
  getLists();
});

const getLists = async () => {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ptl_route`, {
      method: "get-config",
      payload: {},
    });

    if (response.data.code === 200) {
      rules.value = response.data.data.rules || [];

      // ✅ Deduplicate up_interface
      const seen = new Set<string>();
      upInterfaces.value = (response.data.data.up_interface || [])
        .filter((iface: { ifname: string }) => {
          if (seen.has(iface.ifname)) return false;
          seen.add(iface.ifname);
          return true;
        })
        .map((iface: { ifname: string }) => ({
          label: iface.ifname,
          id: iface.ifname,
        }));
    }
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">
        {{ t("Application Aware Routing") }}
      </NeHeading>
    </div>

    <p class="mb-6 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
      {{ t("Configure VRF interfaces and routing rules.") }}
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
        <NeButton kind="primary" @click="openDrawer(null)">
          {{ t("Add Application") }}
        </NeButton>

        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>#</NeTableHeadCell>
            <NeTableHeadCell>Rule Name</NeTableHeadCell>
            <NeTableHeadCell>App Name</NeTableHeadCell>
            <NeTableHeadCell>Interface</NeTableHeadCell>
             <NeTableHeadCell>Gateway</NeTableHeadCell>
            <NeTableHeadCell>Status</NeTableHeadCell>
            <NeTableHeadCell>Service</NeTableHeadCell>
            <NeTableHeadCell>{{ t("common.actions") }}</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in rules" :key="index">
              <NeTableCell>{{ index + 1 }}</NeTableCell>
              <NeTableCell>{{ item.rule_name }}</NeTableCell>
              <NeTableCell>{{ item.app_name }}</NeTableCell>
              <NeTableCell>{{ item.interface }}</NeTableCell>
              <NeTableCell>{{ item.gateway }}</NeTableCell>
              <NeTableCell>{{ item.status }}</NeTableCell>
              <NeTableCell>{{ item.service }}</NeTableCell>
              <NeTableCell>
                <div class="flex gap-2">
                  <NeButton kind="tertiary" size="lg" @click="openDrawer(item)">
                    <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4 mr-1" />
                    {{ t("common.edit") }}
                  </NeButton>

                  <NeButton
                    kind="tertiary"
                    size="lg"
                    @click="openDeleteModal(item.rule_name)"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4 mr-1" />
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
    :itemToDelete="selectedRuleName"
    @close="showDeleteModal = false"
    @tunnel-deleted="getLists"
  />

  <!-- ✅ Pass deduplicated upInterfaces -->
  <ApplicationDrawer
    :is-shown="showDrawer"
    :item-to-edit="selectedRule"
    :source-interfaces="upInterfaces"
    @close="closeModalsAndDrawers"
    @tunnel-added="getLists"
  />
</template>
