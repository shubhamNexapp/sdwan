<script setup lang="ts">
import { computed, ref, watch } from "vue";
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

const props = defineProps<{
  visible: boolean;
  itemToEdit: any | null;
  groups?: { group_name: string }[]; // 👈 optional now
}>();

const emit = defineEmits(["close", "saved"]);

// state
const isCreating = ref(true);
const loading = ref({ addRule: false, editRule: false });

const form = ref({
  rule_name: "",
  enabled: true,
  group: "",
  action: "block",
  describe: "",
  app_name: [] as string[],
});

// load form when editing
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
        app_name: val.app_name.map((a: any) => a.name),
      };
    } else {
      isCreating.value = true;
      form.value = {
        rule_name: "",
        enabled: true,
        group: props.groups?.length ? props.groups[0].group_name : "",
        action: "block",
        describe: "",
        app_name: [],
      };
    }
  },
  { immediate: true }
);

// dropdowns
const actionOptions = [
  { id: "block", label: "Block" },
  { id: "accept", label: "Accept" },
];

const groupOptions = computed(() =>
  ""
);

// app search + results
const searchQuery = ref("");
const searchResults = ref<{ name: string; category?: string }[]>([]);

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
      name: r.name,
      category: r.category,
    }));
  } catch (e) {
    console.error("app search error:", getAxiosErrorMessage(e));
  }
}

function toggleApp(name: string) {
  if (form.value.app_name.includes(name)) {
    form.value.app_name = form.value.app_name.filter((n) => n !== name);
  } else {
    form.value.app_name = [...form.value.app_name, name];
  }
}

// save
async function saveRule() {
  try {
    const payload = {
      ...form.value,
      enabled: form.value.enabled ? "1" : "0",
      app_name: form.value.app_name.map((n) => ({ name: n })),
    };

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
  <NeModal :visible="props.visible" size="xxl" :title="isCreating ? t('Create rule') : t('Edit rule')"
    :primaryLabel="isCreating ? t('Create rule') : t('Save rule')" :cancelLabel="t('common.cancel')"
    :primaryButtonDisabled="loading.addRule || loading.editRule"
    :primaryButtonLoading="loading.addRule || loading.editRule" :closeAriaLabel="t('common.close')"
    @close="emit('close')" @primaryClick="saveRule">
    <div class="space-y-4">
      <!-- Enable toggle -->
      <div class="flex items-center gap-3">
        <NeToggle v-model="form.enabled" />
        <span>{{ t("Enable rule") }}</span>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <NeTextInput v-model="form.rule_name" :label="t('Rule Name')" />
        <NeTextInput v-model="form.group" :label="t('Source Group')" />
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
          <NeCard v-for="item in searchResults" :key="item.name">
            <div class="flex min-w-0 grow items-center justify-between">
              <div class="flex min-w-0 items-center gap-4">
                <font-awesome-icon :icon="['fas', 'diagram-project']" class="h-6 w-6" aria-hidden="true" />
                <div class="flex flex-col">
                  <div class="font-medium">{{ item.name }}</div>
                  <p class="text-xs text-gray-500">APP / {{ item.category.name }}</p>
                </div>
              </div>
              <NeToggle class="relative left-3" />
            </div>
          </NeCard>
        </div>

        <!-- <div class="grid grid-cols-3 gap-3">
          <NeCard v-for="item in searchResults" :key="item.name" class="flex justify-between items-center p-3">
            <div>
              <font-awesome-icon :icon="['fab', 'facebook']" class="h-6 w-6" aria-hidden="true" />
              <p class="font-medium">{{ item.name }}</p>
              <p class="text-xs text-gray-500">APP / {{ item.category.name }}</p>
            </div>
            <NeToggle :modelValue="form.app_name.includes(item.name)" @change="toggleApp(item.name)" />
          </NeCard>
        </div> -->
      </div>

      <div v-if="form.app_name.length" class="text-sm text-gray-600">
        {{ form.app_name.length }} {{ t("apps and protocols selected") }}
      </div>
    </div>
  </NeModal>
</template>
