<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { useI18n } from "vue-i18n";
import PolicyCard from "./PolicyCard.vue";
import {
  NeModal,
  NeButton,
  NeTextInput,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import AddRuleModal from "./AddRuleModal.vue";
import RuleForm from "./RuleForm.vue";

const addModalVisible = ref(false);

const handleRuleSaved = (newRule: any) => {
  // append new rule to rules list
  rules.value.push({
    ...newRule,
    enabled: newRule.enabled === "1",
    src_ip: newRule.src_ip.map((ipObj: any) => ipObj.ip),
    app_name: newRule.app_name.map((appObj: any) => appObj.name),
  });
};

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

// 🔹 modal state
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const selectedRule = ref<Rule | null>(null);

// Form fields for editing
const editForm = ref<Rule>({
  rule_name: "",
  enabled: true,
  action: "",
  src_ip: [],
  app_name: [],
  type: "",
  describe: "",
});

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
  } catch (err: any) {
    error.value = "Failed to load rules";
  } finally {
    loading.value = false;
  }
};

// 🔹 Open Edit Modal
const openEdit = (rule: Rule) => {
  selectedRule.value = rule;
  editForm.value = { ...rule }; // copy values into form
  editModalVisible.value = true;
};

// 🔹 Open Delete Modal
const openDelete = (rule: Rule) => {
  selectedRule.value = rule;
  deleteModalVisible.value = true;
};

// 🔹 Save changes from edit modal
const editRule = async () => {
  try {
    if (!editForm.value) return;

    // ✅ Build payload dynamically from editForm
    const payload = {
      rule_name: editForm.value.rule_name,
      enabled: editForm.value.enabled ? "1" : "0", // convert boolean → "1"/"0"
      action: editForm.value.action,
      src_ip: editForm.value.src_ip.map((ip) => ({ ip })), // convert string[] → {ip}
      type: editForm.value.type,
      app_name: editForm.value.app_name.map((name) => ({ name })), // convert string[] → {name}
      describe: editForm.value.describe,
    };

    const response = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "edit-rule",
      payload,
    });

    // ✅ Update local state without reloading everything
    const idx = rules.value.findIndex((r) => r.rule_name === payload.rule_name);
    if (idx !== -1) {
      rules.value[idx] = { ...editForm.value };
    }

    editModalVisible.value = false;
  } catch (err) {
    console.error("Error editing rule:", getAxiosErrorMessage(err));
  }
};

// 🔹 Confirm delete
const confirmDelete = () => {
  if (!selectedRule.value) return;

  axios
    .post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "delete-rule",
      payload: { rule_name: selectedRule.value.rule_name },
    })
    .then(() => {
      // Remove from local state
      rules.value = rules.value.filter(
        (r) => r.rule_name !== selectedRule.value!.rule_name
      );
      deleteModalVisible.value = false;
    })
    .catch((err) => {
      console.error("Error deleting rule:", getAxiosErrorMessage(err));
    });
};

onMounted(() => {
  getRules();
});
</script>

<template>
  <!-- Top Bar -->
  <!-- <div class="items-right">
    <NeButton kind="secondary" @click="addModalVisible = true">
      <font-awesome-icon :icon="['fas', 'circle-plus']" class="mr-2 h-4 w-4" />
      {{ t("Add Rule") }}
    </NeButton>
  </div> -->

  <!-- Top Bar -->
  <div class="flex flex-row items-center justify-between">
    <p class="max-w-2xl text-sm text-gray-500">
      {{ t("standalone.dpi.exceptions_description") }}
    </p>
    <NeButton kind="secondary" @click="addModalVisible = true">
      <font-awesome-icon :icon="['fas', 'circle-plus']" class="mr-2 h-4 w-4" />
      {{ t("Add Rule") }}
    </NeButton>
  </div>

  <AddRuleModal
    :visible="addModalVisible"
    @close="addModalVisible = false"
    @saved="handleRuleSaved"
  />
  <div class="p-4">
    <div v-if="loading">Loading rules...</div>
    <div v-else-if="error" class="text-red-500">{{ error }}</div>
    <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 2xl:grid-cols-3">
      <PolicyCard
        v-for="(rule, index) in rules"
        :key="index"
        :rule="rule"
        @edit="openEdit"
        @delete="openDelete"
      />
    </div>

    <!-- ✏️ Edit Modal -->
    <NeModal
      :visible="editModalVisible"
      title="Edit Rule"
      @close="editModalVisible = false"
    >
      <div class="p-4">
        <RuleForm v-model="editForm" />
      </div>
      <NeButton class="mr-4" kind="secondary" @click="editModalVisible = false"
        >Cancel</NeButton
      >
      <NeButton kind="primary" @click="editRule">Save</NeButton>
    </NeModal>

    <!-- 🗑 Delete Modal -->
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

      <NeButton
        class="mr-2"
        kind="secondary"
        @click="deleteModalVisible = false"
      >
        {{ t("common.cancel") }}
      </NeButton>
      <NeButton kind="primary" @click="confirmDelete">
        {{ t("Delete") }}
      </NeButton>
    </NeModal>
  </div>
</template>
