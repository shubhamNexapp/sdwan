<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import axios from "axios";
import {
  NeModal,
  NeTextInput,
  NeCombobox,
  NeToggle,
  NeCard,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Props
const props = defineProps<{
  visible: boolean;
  itemToEdit: any | null;
}>();

const emit = defineEmits(["close", "saved"]);

// State
const isCreating = ref(true);
const loading = ref({ addRule: false, editRule: false });
const groups = ref<{ group_name: string }[]>([]);

// Main form
const form = ref({
  rule_name: "",
  enabled: true,
  group: "",
  action: "block",
  describe: "",
  app_name: [] as { name: string }[], // ✅ store apps here
});

// Fetch groups
async function fetchGroups() {
  try {
    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-rule",
      payload: {},
    });
    groups.value = res.data?.data?.exist_group || [];
  } catch (e) {
    console.error("group fetch error:", getAxiosErrorMessage(e));
  }
}

onMounted(() => {
  fetchGroups();
});

// Load form on edit
watch(
  () => props.itemToEdit,
  (val) => {
    if (val) {
      isCreating.value = false;
      form.value = {
        rule_name: val.rule_name,
        enabled: val.enabled === "1",
        group: val.group,
        action: val.action,
        describe: val.describe,
        app_name: val.app_name || [],
      };
    } else {
      isCreating.value = true;
      form.value = {
        rule_name: "",
        enabled: true,
        group: groups.value.length ? groups.value[0].group_name : "",
        action: "block",
        describe: "",
        app_name: [],
      };
    }
  },
  { immediate: true }
);

// Options
const actionOptions = [
  { id: "block", label: "Block" },
  { id: "accept", label: "Accept" },
];

const groupOptions = computed(() =>
  groups.value.map((g) => ({ id: g.group_name, label: g.group_name }))
);

// --- APP SEARCH ---
const searchQuery = ref("");
const searchResults = ref<{ id: number; name: string; category?: string }[]>([]);

let searchTimeout: any;
watch(searchQuery, (val) => {
  clearTimeout(searchTimeout);
  if (!val) {
    searchResults.value = [];
    return;
  }
  searchTimeout = setTimeout(() => fetchApps(val), 400);
});

async function fetchApps(query: string) {
  try {
    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "search-field",
      payload: { search: query },
    });

    const results = res.data?.data?.values?.data || [];
    searchResults.value = results.map((r: any) => ({
      id: r.id,
      name: r.name,
      category: r.category?.name || "Unknown",
    }));
  } catch (e) {
    console.error("app search error:", getAxiosErrorMessage(e));
  }
}

// Toggle app add/remove
function toggleApp(app: { name: string }) {
  const exists = form.value.app_name.find((a) => a.name === app.name);
  if (exists) {
    form.value.app_name = form.value.app_name.filter((a) => a.name !== app.name);
  } else {
    form.value.app_name.push({ name: app.name });
  }
}

// Check if app is already selected
function isAppSelected(appName: string) {
  return form.value.app_name.some((a) => a.name === appName);
}

// --- SAVE RULE ---
async function saveRule() {
  try {
    const payload = 
      {
        ...form.value,
        enabled: form.value.enabled ? "1" : "0",
      }

    if (isCreating.value) {
      loading.value.addRule = true;
      await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
        method: "add-rule",
        payload,
      });
    } else {
      loading.value.editRule = true;
      await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
        method: "edit-rule",
        payload,
      });
    }

    emit("saved", { ...form.value }, !isCreating.value);
    emit("close");
  } catch (e) {
    console.error("save error:", getAxiosErrorMessage(e));
  } finally {
    loading.value.addRule = false;
    loading.value.editRule = false;
  }
}
</script>

<template>
  <NeModal
    :visible="props.visible"
    size="xxl"
    :title="isCreating ? t('Create rule') : t('Edit rule')"
    :primaryLabel="isCreating ? t('Create rule') : t('Save rule')"
    :cancelLabel="t('common.cancel')"
    :primaryButtonDisabled="loading.addRule || loading.editRule"
    :primaryButtonLoading="loading.addRule || loading.editRule"
    :closeAriaLabel="t('common.close')"
    @close="emit('close')"
    @primaryClick="saveRule"
  >
    <div class="space-y-4">
      <!-- Enable toggle -->
      <div class="flex items-center gap-3">
        <NeToggle v-model="form.enabled" />
        <span>{{ t("Enable rule") }}</span>
      </div>

      <!-- Rule form -->
      <div class="grid grid-cols-2 gap-4">
        <NeTextInput v-model="form.rule_name" :label="t('Rule Name')" />
        <NeCombobox v-model="form.group" :options="groupOptions" :label="t('Source Group')" />
        <NeCombobox v-model="form.action" :options="actionOptions" :label="t('Action')" />
        <NeTextInput v-model="form.describe" :label="t('Describe')" />
      </div>

      <!-- App search -->
      <NeTextInput v-model="searchQuery" :label="t('Apps and protocols to block')" />

      <!-- Results -->
      <div v-if="searchResults.length" class="space-y-2">
        <div class="flex justify-between items-center">
          <span>{{ t("Search results") }}</span>
          <button class="text-blue-500 underline text-sm" @click="searchResults = []">
            {{ t("Clear search") }}
          </button>
        </div>

        <div class="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2 2xl:grid-cols-3">
          <NeCard v-for="item in searchResults" :key="item.id">
            <div class="flex min-w-0 grow items-center justify-between">
              <div class="flex min-w-0 items-center gap-4">
                <font-awesome-icon :icon="['fas', 'diagram-project']" class="h-6 w-6" />
                <div class="flex flex-col">
                  <div class="font-medium">{{ item.name }}</div>
                  <p class="text-xs text-gray-500">APP / {{ item.category }}</p>
                </div>
              </div>
              <!-- ✅ toggle app -->
              <NeToggle
                class="relative left-3"
                :modelValue="isAppSelected(item.name)"
                @update:modelValue="() => toggleApp(item)"
              />
            </div>
          </NeCard>
        </div>
      </div>
    </div>
  </NeModal>
</template>
