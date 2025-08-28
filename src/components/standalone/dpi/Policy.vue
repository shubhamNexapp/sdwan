<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { useI18n } from "vue-i18n";
import PolicyCard from "./PolicyCard.vue";
import PolicyDrawer from "./PolicyDrawer.vue";
import {
  NeButton,
  getAxiosErrorMessage,
  NeModal,
} from "@nethesis/vue-components";

const { t } = useI18n();

interface Rule {
  rule_name: string;
  enabled: boolean;
  action: string;
  src_ip: string[];
  app_name: string[];
  type: string;
  describe: string;
}

const rules = ref<Rule[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Drawer state
const drawerVisible = ref(false);
const editingRule = ref<Rule | null>(null);
const deleteModalVisible = ref(false);
const selectedRule = ref<Rule | null>(null);

const openAddDrawer = () => {
  editingRule.value = null;
  drawerVisible.value = true;
};

const openEditDrawer = (rule: Rule) => {
  editingRule.value = { ...rule };
  drawerVisible.value = true;
};

const openDelete = (rule: Rule) => {
  selectedRule.value = rule;
  deleteModalVisible.value = true;
};

const getRules = async () => {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-rule",
      payload: {},
    });

    const apiRules = response.data?.data?.rules || [];
    rules.value = apiRules.map((item: any) => ({
      rule_name: item.rule_name,
      enabled: item.enabled === "1",
      action: item.action,
      src_ip: item.src_ip.map((ipObj: any) => ipObj.ip),
      app_name: item.app_name.map((appObj: any) => appObj.name),
      type: item.type,
      describe: item.describe,
    }));
  } catch (err) {
    error.value = "Failed to load rules";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getRules();
});

// Handle save from drawer
const handleSave = (rule: Rule, isEdit: boolean) => {
  if (isEdit) {
    // Update locally
    const idx = rules.value.findIndex((r) => r.rule_name === rule.rule_name);
    if (idx !== -1) rules.value[idx] = rule;
  } else {
    // Add new
    rules.value.push(rule);
  }
  drawerVisible.value = false;
};

const confirmDelete = async () => {
  if (!selectedRule.value) return;
  try {
    loading.value = true;
    await axios
      .post(`${getSDControllerApiEndpoint()}/dpi`, {
        method: "delete-rule",
        payload: { rule_name: selectedRule.value.rule_name },
      })
      .then(() => {
        rules.value = rules.value.filter(
          (r) => r.rule_name !== selectedRule.value!.rule_name
        );
        deleteModalVisible.value = false;
      })
      .catch((err) => {
        console.error("Error deleting rule:", getAxiosErrorMessage(err));
      });
  } catch (err) {
    error.value = "Failed to load rules";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-4">
    <!-- Top Bar -->
    <div class="mb-4 flex flex-row items-center justify-between">
      <p class="max-w-2xl text-sm text-gray-500">
        {{ t("standalone.dpi.exceptions_description") }}
      </p>
      <NeButton kind="secondary" @click="openAddDrawer">
        <font-awesome-icon
          :icon="['fas', 'circle-plus']"
          class="mr-2 h-4 w-4"
        />
        {{ t("Add Rule") }}
      </NeButton>
    </div>

    <!-- Rules -->
    <div v-if="loading">Loading rules...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
      <PolicyCard
        v-for="(rule, index) in rules"
        :key="index"
        :rule="rule"
        @edit="openEditDrawer"
        @delete="openDelete"
      />
    </div>

    <!-- Side Drawer for Add/Edit -->
    <PolicyDrawer
      :is-shown="drawerVisible"
      :item-to-edit="editingRule"
      @close="drawerVisible = false"
      @saved="handleSave"
    />
  </div>

  <NeModal
    :visible="deleteModalVisible"
    closeAriaLabel="Close delete modal"
    title="Delete Rule"
    @close="deleteModalVisible = false"
  >
    <div class="p-4">
      <p>
        Are you sure you want to delete rule
        <b>{{ selectedRule?.rule_name }}</b
        >?
      </p>
    </div>

    <NeButton class="mr-2" kind="secondary" @click="deleteModalVisible = false">
      {{ t("common.cancel") }}
    </NeButton>
    <NeButton kind="primary" @click="confirmDelete">
      {{ t("Delete") }}
    </NeButton>
  </NeModal>
</template>
