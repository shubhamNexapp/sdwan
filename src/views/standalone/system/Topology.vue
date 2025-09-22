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

import DeleteTunnelModal from "@/components/standalone/topology/DeleteModalTopology.vue";
import TopologyDrawer from "@/components/standalone/topology/TopologyDrawer.vue";

export type TopologyRule = {
  service: string;
  name: string;
  topology_type: string;
  uuid: string;
  key: string;
};

const { t } = useI18n();
const loading = ref(true);
const rules = ref<TopologyRule[]>([]);
const upInterfaces = ref<{ label: string; id: string }[]>([]);

const selectedRule = ref<TopologyRule | null>(null);
const showDrawer = ref(false);
const showDeleteModal = ref(false);
const selectedRuleName = ref<string | null>(null);

const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});

function openDrawer(rule: TopologyRule | null) {
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
    const response = await axios.post(`${getSDControllerApiEndpoint()}/topology`, {
      method: "get-config",
      payload: {}
    });

    if (response.data.code === 200) {
      rules.value = response.data.data || [];

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
        {{ t("Topology") }}
      </NeHeading>
    </div>

    <p class="mb-6 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
      {{ t("Configure topology and routing rules.") }}
    </p>

    <div class="space-y-6">
      <NeInlineNotification kind="error" :title="error.notificationTitle" :description="error.notificationDescription"
        v-if="error.notificationTitle">
        <template v-if="error.notificationDetails">
          {{ error.notificationDetails }}
        </template>
      </NeInlineNotification>

      <NeSkeleton v-if="loading" :lines="8" size="lg" />

      <template v-else>
        <NeButton kind="primary" @click="openDrawer(null)">
          {{ t("Add Topology") }}
        </NeButton>

        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>#</NeTableHeadCell>
            <NeTableHeadCell>Name</NeTableHeadCell>
            <NeTableHeadCell>Service</NeTableHeadCell>
            <NeTableHeadCell>Topl Type</NeTableHeadCell>
            <NeTableHeadCell>UUID</NeTableHeadCell>
            <NeTableHeadCell>Key</NeTableHeadCell>
            <NeTableHeadCell>{{ t("common.actions") }}</NeTableHeadCell>
          </NeTableHead>
          <NeTableBody>
            <NeTableRow v-for="(item, index) in rules" :key="index">
              <NeTableCell>{{ index + 1 }}</NeTableCell>
              <NeTableCell>{{ item.name }}</NeTableCell>
              <NeTableCell>{{ item.service }}</NeTableCell>
              <NeTableCell>{{ item.topology_type }}</NeTableCell>
              <NeTableCell>{{ item.uuid }}</NeTableCell>
              <NeTableCell>{{ item.key }}</NeTableCell>
              <NeTableCell>
                <div class="flex gap-2">
                  <NeButton kind="tertiary" size="lg" @click="openDeleteModal(item.name)">
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

  <DeleteTunnelModal :visible="showDeleteModal" :itemToDelete="selectedRuleName" @close="showDeleteModal = false"
    @tunnel-deleted="getLists" />

  <!-- ✅ Pass deduplicated upInterfaces -->
  <TopologyDrawer :is-shown="showDrawer" :item-to-edit="selectedRule" :source-interfaces="upInterfaces"
    @close="closeModalsAndDrawers" @tunnel-added="getLists" />
</template>
