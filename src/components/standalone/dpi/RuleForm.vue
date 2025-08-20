<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import {
  NeTextInput,
  NeCombobox,
  NeCard,
  NeToggle,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  modelValue: any; // v-model for form data
}>();
const emits = defineEmits(["update:modelValue"]);

// Local form state mirrors props.modelValue
const form = ref({ ...props.modelValue });

// Sync external changes → local form
watch(
  () => props.modelValue,
  (newVal) => {
    form.value = { ...newVal };
  },
  { deep: true }
);

// Sync local → parent
watch(
  form,
  (newVal) => {
    emits("update:modelValue", newVal);
  },
  { deep: true }
);

// --- Dynamic options
const dynamicApplicationOptions = ref<{ name: string; enabled: boolean }[]>([]);
const dynamicProtocolOptions = ref<{ name: string; enabled: boolean }[]>([]);
const dynamicSingleOptions = ref<{ name: string; enabled: boolean }[]>([]);
const singleSearch = ref("");

// Action dropdown options
const actionOptions = [
  { id: "block", label: "Block" },
  { id: "accept", label: "Accept" },
];

// --- API calls
const fetchApplicationOptions = async () => {
  try {
    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-app-idenx",
      payload: {},
    });
    dynamicApplicationOptions.value = res.data.data.map((item: any) => ({
      name: item.name,
      enabled: form.value.app_name?.includes(item.name) || false,
    }));
  } catch (err) {
    console.error("Fetch application error:", getAxiosErrorMessage(err));
  }
};

const fetchProtocolOptions = async () => {
  try {
    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "get-pol-idenx",
      payload: { search: "networks" },
    });
    dynamicProtocolOptions.value = res.data.data.map((item: any) => ({
      name: item.name,
      enabled: form.value.app_name?.includes(item.name) || false,
    }));
  } catch (err) {
    console.error("Fetch protocol error:", getAxiosErrorMessage(err));
  }
};

const fetchSingleOptions = async (query: string) => {
  if (!query) {
    dynamicSingleOptions.value = [];
    return;
  }
  try {
    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "search-field",
      payload: { search: query },
    });
    const results = res.data?.data?.values?.data || [];
    dynamicSingleOptions.value = results.map((item: any) => ({
      name: item.name,
      enabled: form.value.app_name?.includes(item.name) || false,
    }));
  } catch (err) {
    console.error("Fetch single error:", getAxiosErrorMessage(err));
  }
};

// Watch type change
watch(
  () => form.value.type,
  (newVal) => {
    if (newVal === "application") {
      fetchApplicationOptions();
      dynamicProtocolOptions.value = [];
      dynamicSingleOptions.value = [];
    } else if (newVal === "protocol") {
      fetchProtocolOptions();
      dynamicApplicationOptions.value = [];
      dynamicSingleOptions.value = [];
    } else if (newVal === "single") {
      singleSearch.value = "";
      dynamicApplicationOptions.value = [];
      dynamicProtocolOptions.value = [];
      dynamicSingleOptions.value = [];
    }
  },
  { immediate: true }
);

// Debounce for single search
let searchTimeout: any;
watch(singleSearch, (newVal) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    fetchSingleOptions(newVal);
  }, 500);
});
</script>

<template>
  <div class="space-y-4">
    <NeTextInput v-model="form.rule_name" label="Rule Name" />

    <NeCombobox v-model="form.action" :options="actionOptions" label="Action" />

    <NeCombobox
      v-model="form.type"
      :options="[
        { label: 'Application', id: 'application' },
        { label: 'Protocol', id: 'protocol' },
        { label: 'Single', id: 'single' },
      ]"
      :label="t('Type')"
    />

    <NeTextInput
      v-model="form.src_ip_string"
      label="Source IPs (comma separated)"
    />

    <NeTextInput v-model="form.describe" label="Description" />

    <div v-if="form.type === 'single'">
      <NeTextInput v-model="singleSearch" label="Apps Search" />
    </div>

    <!-- Lists -->
    <NeCard
      v-if="form.type === 'application' && dynamicApplicationOptions.length"
    >
      <div
        v-for="(item, index) in dynamicApplicationOptions"
        :key="item.name"
        class="flex justify-between p-2"
      >
        <p>{{ item.name }}</p>
        <NeToggle
          v-model="dynamicApplicationOptions[index].enabled"
          @change="() => {
            if (dynamicApplicationOptions[index].enabled) {
              form.app_name.push(item.name);
            } else {
              form.app_name = form.app_name.filter((n: string) => n !== item.name);
            }
          }"
        />
      </div>
    </NeCard>

    <NeCard v-if="form.type === 'protocol' && dynamicProtocolOptions.length">
      <div
        v-for="(item, index) in dynamicProtocolOptions"
        :key="item.name"
        class="flex justify-between p-2"
      >
        <p>{{ item.name }}</p>
        <NeToggle
          v-model="dynamicProtocolOptions[index].enabled"
          @change="() => {
            if (dynamicProtocolOptions[index].enabled) {
              form.app_name.push(item.name);
            } else {
              form.app_name = form.app_name.filter((n: string) => n !== item.name);
            }
          }"
        />
      </div>
    </NeCard>

    <NeCard v-if="form.type === 'single' && dynamicSingleOptions.length">
      <div
        v-for="(item, index) in dynamicSingleOptions"
        :key="item.name"
        class="flex justify-between p-2"
      >
        <p>{{ item.name }}</p>
        <NeToggle
          v-model="dynamicSingleOptions[index].enabled"
          @change="() => {
            if (dynamicSingleOptions[index].enabled) {
              form.app_name.push(item.name);
            } else {
              form.app_name = form.app_name.filter((n: string) => n !== item.name);
            }
          }"
        />
      </div>
    </NeCard>
  </div>
</template>
