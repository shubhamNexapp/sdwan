<script setup lang="ts">
import { ref, watch } from "vue";
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

const props = defineProps<{ modelValue: any }>();
const emits = defineEmits(["update:modelValue"]);

const form = ref({ ...props.modelValue });

// keep parent sync
watch(
  () => props.modelValue,
  (val) => {
    form.value = { ...val };
  },
  { deep: true }
);

watch(
  form,
  (val) => {
    emits("update:modelValue", val);
  },
  { deep: true }
);

// dropdown options
const actionOptions = [
  { id: "block", label: "Block" },
  { id: "accept", label: "Accept" },
];

const typeOptions = [
  { id: "application", label: "Application" },
  { id: "protocol", label: "Protocol" },
  { id: "single", label: "Single" },
];

// dynamic lists
const dynamicApplicationOptions = ref<{ name: string; enabled: boolean }[]>([]);
const dynamicProtocolOptions = ref<{ name: string; enabled: boolean }[]>([]);
const dynamicSingleOptions = ref<{ name: string; enabled: boolean }[]>([]);
const singleSearch = ref("");

// --- API
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
  } catch (e) {
    console.error("app fetch error:", getAxiosErrorMessage(e));
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
  } catch (e) {
    console.error("protocol fetch error:", getAxiosErrorMessage(e));
  }
};

const fetchSingleOptions = async (query: string) => {
  if (!query) return (dynamicSingleOptions.value = []);
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
  } catch (e) {
    console.error("single fetch error:", getAxiosErrorMessage(e));
  }
};

// watch type change
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

// debounce search
let searchTimeout: any;
watch(singleSearch, (newVal) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => fetchSingleOptions(newVal), 500);
});

// toggle handler (fix: keep array stable)
const toggleApp = (name: string, enabled: boolean) => {
  if (enabled) {
    if (!form.value.app_name.includes(name)) {
      form.value.app_name = [...form.value.app_name, name];
    }
  } else {
    form.value.app_name = form.value.app_name.filter((n: string) => n !== name);
  }
};
</script>

<template>
  <div class="space-y-4">
    <!-- ✅ RULE NAME stays what user types -->
    <NeTextInput v-model="form.rule_name" label="Rule Name" />

    <NeCombobox v-model="form.action" :options="actionOptions" label="Action" />

    <NeCombobox v-model="form.type" :options="typeOptions" :label="t('Type')" />

    <NeTextInput
      v-model="form.src_ip_string"
      label="Source IPs (comma separated)"
    />

    <NeTextInput v-model="form.describe" label="Description" />

    <div v-if="form.type === 'single'">
      <NeTextInput v-model="singleSearch" label="Apps Search" />
    </div>

    <!-- Application list -->
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
          @change="
            toggleApp(item.name, dynamicApplicationOptions[index].enabled)
          "
        />
      </div>
    </NeCard>

    <!-- Protocol list -->
    <NeCard v-if="form.type === 'protocol' && dynamicProtocolOptions.length">
      <div
        v-for="(item, index) in dynamicProtocolOptions"
        :key="item.name"
        class="flex justify-between p-2"
      >
        <p>{{ item.name }}</p>
        <NeToggle
          v-model="dynamicProtocolOptions[index].enabled"
          @change="toggleApp(item.name, dynamicProtocolOptions[index].enabled)"
        />
      </div>
    </NeCard>

    <!-- Single list -->
    <NeCard v-if="form.type === 'single' && dynamicSingleOptions.length">
      <div
        v-for="(item, index) in dynamicSingleOptions"
        :key="item.name"
        class="flex justify-between p-2"
      >
        <p>{{ item.name }}</p>
        <NeToggle
          v-model="dynamicSingleOptions[index].enabled"
          @change="toggleApp(item.name, dynamicSingleOptions[index].enabled)"
        />
      </div>
    </NeCard>
  </div>
</template>
