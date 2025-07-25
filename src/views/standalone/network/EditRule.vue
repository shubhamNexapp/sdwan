<script setup lang="ts">
import {
  NeSideDrawer,
  NeButton,
  NeTextInput,
  NeToggle,
  NeCombobox,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { ref, watch, computed } from "vue";
import { useNotificationsStore } from "@/stores/notifications";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Saved, Success } from "@/lib/tost";

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const props = defineProps<{
  isShown: boolean;
  itemToEdit?: any | null;
}>();

const emit = defineEmits(["close", "save", "tunnel-added"]);

const isEditMode = computed(() => !!props.itemToEdit);

const loading = ref({
  saveRule: false,
});

const ruleService = ref(false);
const ruleName = ref("");
const ruleSource = ref("");
const ruleDestination = ref("");
const ruleProtocol = ref("");
const port = ref("");
const outgoingMode = ref("");
const manualInterface = ref("");

const errorBag = ref<{ [key: string]: string }>({});

const outgoingModeOptions = [
  { label: "Manual", id: "manual" },
  { label: "Quality (qua)", id: "qua" },
  { label: "Lowest Cost", id: "lowest_cost" },
  { label: "Max Bandwidth", id: "max_bandwidth" },
];

// 🧠 Watch for Edit Data
watch(
  () => props.itemToEdit,
  (newVal) => {
    if (newVal) {
      ruleService.value = newVal.rule_service === "enable";
      ruleName.value = newVal.rule_name || "";
      ruleSource.value = newVal.rule_source || "";
      ruleDestination.value = newVal.rule_destination || "";
      ruleProtocol.value = newVal.rule_protocol || "";
      port.value = newVal.port || "";
      outgoingMode.value = newVal.outgoing_mode || "";
      manualInterface.value = newVal.manual_interface || "";
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  ruleService.value = false;
  ruleName.value = "";
  ruleSource.value = "";
  ruleDestination.value = "";
  ruleProtocol.value = "";
  port.value = "";
  outgoingMode.value = "";
  manualInterface.value = "";
  errorBag.value = {};
}

// Validation
const validate = () => {
  errorBag.value = {};
  if (ruleService.value && !ruleName.value.trim()) {
    errorBag.value.ruleName = "Name is required.";
  }
  if (!ruleProtocol.value) {
    errorBag.value.ruleProtocol = "Protocol is required.";
  }
  return Object.keys(errorBag.value).length === 0;
};

// Save or Update
const saveRule = async () => {
  if (!validate()) return;

  loading.value.saveRule = true;
  const method = isEditMode.value ? "edit-rule" : "add-rule";

  const payload: any = {
    rule_name: ruleName.value,
    rule_service: ruleService.value ? "enable" : "disable",
    rule_source: ruleSource.value,
    rule_destination: ruleDestination.value,
    rule_protocol: ruleProtocol.value,
    port: port.value,
    outgoing_mode: outgoingMode.value,
  };

  if (outgoingMode.value === "manual") {
    payload.manual_interface = manualInterface.value;
  }

  try {
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/performance_sla`,
      {
        method,
        payload,
      }
    );

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: Success,
        description: Saved,
        kind: "success",
      });
      emit("save", payload);
      emit("close");
      emit("tunnel-added");
    }
  } catch (err) {
    console.error("API Error:", getAxiosErrorMessage(err));
  }

  loading.value.saveRule = false;
};

const closeDrawer = () => {
  emit("close");
};
</script>

<template>
  <NeSideDrawer
    :isShown="isShown"
    :title="isEditMode ? 'Edit Rule' : 'Add Rule'"
    closeAriaLabel="Close"
    @close="closeDrawer"
  >
    <form @submit.prevent="saveRule">
      <div class="space-y-6">
        <NeToggle
          v-model="ruleService"
          :label="ruleService ? 'Enable' : 'Disable'"
          :topLabel="'Service'"
        />

        <template v-if="ruleService">
          <NeTextInput
            v-model="ruleName"
            :invalidMessage="errorBag.ruleName"
            label="Name"
            placeholder="Enter rule name"
          />
          <NeTextInput
            v-model="ruleSource"
            label="Source"
            placeholder="Enter Source"
          />
          <NeTextInput
            v-model="ruleDestination"
            label="Destination"
            placeholder="Enter Destination"
          />
          <NeCombobox
            v-model="ruleProtocol"
            :options="[
              { label: 'tcp', id: 'tcp' },
              { label: 'udp', id: 'udp' },
              { label: 'any', id: 'any' }
            ]"
            label="Protocol"
          />
          <span v-if="errorBag.ruleProtocol" class="text-red-500 text-sm">{{
            errorBag.ruleProtocol
          }}</span>

          <NeTextInput v-model="port" label="Port" placeholder="Enter port" />

          <NeCombobox
            v-model="outgoingMode"
            :options="outgoingModeOptions"
            label="Outgoing Mode"
            value-key="id"
            label-key="label"
          />

          <NeTextInput
            v-if="outgoingMode === 'manual'"
            v-model="manualInterface"
            label="Manual Interface"
            placeholder="Enter interface name"
          />
        </template>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex justify-end">
        <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
          Cancel
        </NeButton>
        <NeButton
          :disabled="loading.saveRule"
          :loading="loading.saveRule"
          kind="primary"
          size="lg"
          type="submit"
        >
          <template>
            <FontAwesomeIcon :icon="faSave" />
          </template>
          {{ t("common.save") }}
        </NeButton>
      </div>
    </form>
  </NeSideDrawer>
</template>
