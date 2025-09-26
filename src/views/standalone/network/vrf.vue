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

import DeleteTunnelModal from "@/components/standalone/vrf/vrf_delete.vue";
import VRFDrawer from "@/components/standalone/vrf/vrf_drawer.vue";

export type VRFRule = {
  name: string;
  service: string;
  bind_ifname: string;
  route: { network: string; via: string; dev: string }[];
  status: string;
};

const { t } = useI18n();
const loading = ref(true);
const apiResponse = ref<VRFRule[]>([]);

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
    const response = await axios.post(`${getSDControllerApiEndpoint()}/vrf`, {
      method: "get-config",
      payload: {},
    });
    if (response.data.code === 200) {
      apiResponse.value = response.data.data.rule || [];
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
      <NeHeading tag="h3" class="mb-7">{{ t("VRF") }}</NeHeading>
    </div>

    <p
      class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"
    >
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
         <template #prefix>
                        <font-awesome-icon :icon="['fas', 'circle-plus']" class="h-4 w-4 mt-1" aria-hidden="true" />
                    </template>
          {{ t("Add VRF Rule") }}
        </NeButton>

        <NeTable cardBreakpoint="md" class="mt-2">
          <NeTableHead>
            <NeTableHeadCell>#</NeTableHeadCell>
            <NeTableHeadCell>Rule Name</NeTableHeadCell>
            <NeTableHeadCell>Service</NeTableHeadCell>
            <NeTableHeadCell>Bind Interface</NeTableHeadCell>
            <NeTableHeadCell>Status</NeTableHeadCell>
            <NeTableHeadCell>{{ t("common.actions") }}</NeTableHeadCell>
          </NeTableHead>

          <NeTableBody>
            <NeTableRow v-for="(item, index) in apiResponse" :key="index">
              <NeTableCell>{{ index + 1 }}</NeTableCell>
              <NeTableCell>{{ item.name }}</NeTableCell>
              <NeTableCell>{{ item.service }}</NeTableCell>
              <NeTableCell>{{ item.bind_ifname }}</NeTableCell>
              <NeTableCell>{{ item.status }}</NeTableCell>
              <NeTableCell>
                <div class="flex gap-2">
                  <!-- 🔹 Edit Button -->
                  <NeButton kind="tertiary" size="lg" @click="openDrawer(item)">
                    <template>
                      <font-awesome-icon
                        :icon="['fas', 'pen-to-square']"
                        class="h-4 w-4"
                      />
                    </template>
                    {{ t("common.edit") }}
                  </NeButton>

                  <NeButton
                    kind="tertiary"
                    size="lg"
                    @click="openDeleteModal(item.name)"
                  >
                    <template>
                      <font-awesome-icon
                        :icon="['fas', 'trash']"
                        class="h-4 w-4"
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

  <DeleteTunnelModal
    :visible="showDeleteModal"
    :itemToDelete="selectedRuleName"
    @close="showDeleteModal = false"
    @tunnel-deleted="getLists"
  />

  <VRFDrawer
    :is-shown="showDrawer"
    :item-to-edit="selectedRule"
    @close="closeModalsAndDrawers"
    @tunnel-added="getLists"
  />
</template>
