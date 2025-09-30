<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { useI18n } from "vue-i18n";
import PolicyCard from "./PolicyCard.vue";
import PolicyDrawer from "./PolicyDrawer.vue";
import {
  NeButton,
  NeModal,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";

const { t } = useI18n();

interface Rule {
  rule_name: string;
  enabled: boolean;
  action: string;
  src_ip: string[];   // ❌ not in API
  app_name: string[];
  type: string;       // ❌ not in API
  describe: string;
  group : string
}

const rules = ref<Rule[]>([]);
const groups = ref<{ group_name: string }[]>([]);

const loading = ref(false);
const error = ref<string | null>(null);

const drawerVisible = ref(false);
const editingRule = ref<Rule | null>(null);

const deleteModalVisible = ref(false);
const selectedRule = ref<Rule | null>(null);

// ✅ Load rules from API
const getRules = async () => {
  try {
    loading.value = true;
    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-rule",
      payload: {},
    });

    const apiRules = res.data?.data?.rules || [];
    rules.value = apiRules.map((r: any) => ({
      rule_name: r.rule_name,
      enabled: r.enabled === "1",
      action: r.action,
      group: r.group,
      app_name: r.app_name.map((a: any) => a.name),
      describe: r.describe,
    }));

    groups.value = res.data?.data?.exist_group || [];
    console.log("rules =>", rules.value);
  } catch (err) {
    error.value = "Failed to load rules";
    console.error("getRules error:", getAxiosErrorMessage(err));
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getRules();
});

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

const handleSave = async () => {
  drawerVisible.value = false;
  await getRules();
};

const confirmDelete = async () => {
  if (!selectedRule.value) return;
  try {
    loading.value = true;
    await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "delete-rule",
      payload: { rule_name: selectedRule.value.rule_name },
    });
    rules.value = rules.value.filter(
      (r) => r.rule_name !== selectedRule.value?.rule_name
    );
    deleteModalVisible.value = false;
  } catch (err) {
    error.value = "Failed to delete rule";
    console.error("delete error:", getAxiosErrorMessage(err));
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="p-4">
    <!-- Header -->
    <div class="mb-4 flex justify-between items-center">
      <p class="text-sm text-gray-500">
        {{ t("standalone.dpi.exceptions_description") }}
      </p>
      <NeButton kind="secondary" @click="openAddDrawer">
        <font-awesome-icon :icon="['fas', 'circle-plus']" class="mr-2" />
        {{ t("Add Rule") }}
      </NeButton>
    </div>

    <!-- Rules List -->
    <div v-if="loading">Loading rules...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-6"
    >
      <PolicyCard
        v-for="(rule, index) in rules"
        :key="index"
        :rule="rule"
        @edit="openEditDrawer"
        @delete="openDelete"
      />
    </div>

    <!-- Drawer -->
    <PolicyDrawer
      :visible="drawerVisible"
      :item-to-edit="editingRule"
      :groups="groups"
      @close="drawerVisible = false"
      @saved="handleSave"
    />

    <!-- Delete Modal -->
    <NeModal
      :visible="deleteModalVisible"
      title="Delete Rule"
      @close="deleteModalVisible = false"
    >
      <div class="p-4">
        <p>
          Are you sure you want to delete rule
          <b>{{ selectedRule?.rule_name }}</b>?
        </p>
      </div>
      <NeButton kind="secondary" class="mr-2" @click="deleteModalVisible = false">
        {{ t("common.cancel") }}
      </NeButton>
      <NeButton kind="primary" @click="confirmDelete">
        {{ t("Delete") }}
      </NeButton>
    </NeModal>
  </div>
</template>
