<script setup lang="ts">
import {
  NeSideDrawer,
  NeButton,
  NeTextInput,
  NeToggle,
  NeCombobox,
} from "@nethesis/vue-components";
import { ref, watch, type PropType } from "vue";
import { useNotificationsStore } from "../../../stores/notifications";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { useI18n } from "vue-i18n";
import { useDebounceFn } from "@vueuse/core";

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

export type VRFRule = {
  rule_name: string;
  service: string;
  app_name: string;
  interface: string;
  status: string;
  gateway: string
};

const props = defineProps({
  isShown: { type: Boolean, default: false },
  itemToEdit: { type: Object as PropType<VRFRule | null>, default: null },
  sourceInterfaces: {
    type: Array as PropType<{ label: string; id: string }[]>,
    default: () => [],
  },
});

const emit = defineEmits(["close", "save", "tunnel-added"]);

const loading = ref({ saveRule: false });
const service = ref(false);
const ruleName = ref("");
const sourceInterface = ref("");
const appName = ref("");
const gateway = ref("");


const errorBag = ref<{ [key: string]: string }>({});
const appOptions = ref<{ id: number; name: string; category: string }[]>([]);
const showDropdown = ref(false);

// Watch props (edit mode)
watch(
  () => props.itemToEdit,
  (newVal) => {
    if (newVal) {
      service.value = newVal.service === "enable";
      ruleName.value = newVal.rule_name || "";
      sourceInterface.value = newVal.interface || "";
      appName.value = newVal.app_name || "";
      gateway.value = newVal.gateway || "";
    } else {
      service.value = false;
      ruleName.value = "";
      sourceInterface.value = "";
      appName.value = "";
      gateway.value = ""
    }
  },
  { immediate: true }
);

// Search apps with debounce
const fetchSearchResults = useDebounceFn(async () => {
  if (!appName.value.trim()) {
    appOptions.value = [];
    showDropdown.value = false;
    return;
  }

  try {
    const res = await axios.post(`${getSDControllerApiEndpoint()}/ptl_route`, {
      method: "search-field",
      payload: { search: appName.value },
    });

    if (res.data.code === 200 && res.data.data?.values?.data) {
      appOptions.value = res.data.data.values.data.map((item: any) => ({
        id: item.id,
        name: item.name,
        category: item.category?.name || "unknown",
      }));
      showDropdown.value = appOptions.value.length > 0;
    } else {
      appOptions.value = [];
      showDropdown.value = false;
    }
  } catch (err) {
    console.error("❌ API error:", err);
    appOptions.value = [];
    showDropdown.value = false;
  }
}, 500);

watch(appName, () => {
  fetchSearchResults();
});

const selectApp = (option: { id: number; name: string; category: string }) => {
  appName.value = option.name;
  showDropdown.value = false;
};

// Validation
const validate = () => {
  errorBag.value = {};
  if (!props.itemToEdit && !ruleName.value.trim()) {
    errorBag.value.ruleName = "Rule name is required.";
  }
  if (!appName.value.trim()) errorBag.value.appName = "App name is required.";
  if (!sourceInterface.value.trim())
    errorBag.value.sourceInterface = "Interface is required.";
  return Object.keys(errorBag.value).length === 0;
};

// Save
const saveRule = async () => {
  if (!validate()) return;

  const payload = {
    service: service.value ? "enable" : "disable",
    rule_name: ruleName.value,
    interface: sourceInterface.value,
    app_name: appName.value,
    gateway: gateway.value,
  };

  try {
    loading.value.saveRule = true;
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/ptl_route`,
      {
        method: props.itemToEdit ? "edit-rule" : "add-rule",
        payload,
      }
    );

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: props.itemToEdit
          ? "Configuration updated."
          : "Configuration saved.",
        kind: "success",
      });
      emit("save", payload);
      emit("tunnel-added");
      emit("close");
    }
  } catch (err) {
    console.error("❌ Error saving rule:", err);
  } finally {
    loading.value.saveRule = false;
  }
};

const closeDrawer = () => emit("close");
</script>

<template>
  <NeSideDrawer :isShown="isShown" :title="props.itemToEdit ? 'Edit Application' : 'Add Application'"
    closeAriaLabel="Close" @close="closeDrawer">
    <form @submit.prevent="saveRule">
      <div class="space-y-6">
        <!-- Service Toggle -->
        <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

        <!-- Rule Name -->
        <NeTextInput v-model.trim="ruleName" :label="t('Rule Name')" placeholder="Enter Rule Name"
          :invalidMessage="errorBag.ruleName" :readonly="!!props.itemToEdit" />

        <!-- App Name with Suggestions -->
        <div class="relative">
          <NeTextInput v-model.trim="appName" :label="t('App Name')" placeholder="Search App..."
            :invalidMessage="errorBag.appName" @focus="showDropdown = appOptions.length > 0" />

          <!-- Dropdown -->
          <ul v-if="showDropdown"
            class="absolute z-10 max-h-60 w-full overflow-y-auto rounded border border-gray-300 bg-white shadow">
            <li v-for="option in appOptions" :key="option.id" @click="selectApp(option)"
              class="cursor-pointer px-4 py-2 hover:bg-gray-100">
              <div class="font-medium">{{ option.name }}</div>
              <div class="text-xs text-gray-500">
                Category: {{ option.category }}
              </div>
            </li>
          </ul>
        </div>

        <!-- Interface -->
        <NeCombobox v-model="sourceInterface" :options="props.sourceInterfaces" :label="t('Interface Name')"
          class="grow" />
        <span v-if="errorBag.sourceInterface" class="text-sm text-red-600">
          {{ errorBag.sourceInterface }}
        </span>
      </div>

      <!-- Gateway -->
      <NeTextInput v-model.trim="gateway" :label="t('Gateway')" placeholder="Enter Gateway"
        :invalidMessage="errorBag.gateway"  />

      <!-- Buttons -->
      <div class="mt-6 flex justify-end">
        <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
          Cancel
        </NeButton>
        <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
          @click.prevent="saveRule">
          {{ t("common.save") }}
        </NeButton>
      </div>
    </form>
  </NeSideDrawer>
</template>
