<script setup lang="ts">
import {
  NeSideDrawer,
  NeButton,
  NeTextInput,
  NeToggle,
  getAxiosErrorMessage,
  NeCombobox,
} from "@nethesis/vue-components";
import { ref } from "vue";
import { useNotificationsStore } from "../../../stores/notifications";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "vue-i18n";
import { Saved, Success } from "@/lib/tost";

const { t } = useI18n();

const notificationsStore = useNotificationsStore();

const props = defineProps({
  isShown: { type: Boolean, default: false },
});

let loading = ref({
  listServiceSuggestions: false,
  listObjectSuggestions: false,
  listProtocols: false,
  saveRule: false,
  fetchRule: false,
});

const emit = defineEmits(["close", "save", "tunnel-added"]);

// Form fields
const service = ref(false);
const name = ref("");
const destination = ref("");
const timeInterval = ref("");
const retryTimes = ref("");
const command = ref("");
const timeOutAction = ref("");
const sourceInterface = ref("");
const checkType = ref("");

const ruleName = ref("");
const ruleService = ref(false);
const ruleSource = ref("");
const ruleDestination = ref("");
const ruleProtocol = ref("");
const port = ref("");
const outgoingMode = ref("");
const manualInterface = ref("");

const outgoingModeOptions = [
  { label: "Manual", id: "manual" },
  { label: "Quality (qua)", id: "qua" },
  { label: "Lowest Cost", id: "lowest_cost" },
  { label: "Max Bandwidth", id: "max_bandwidth" },
];

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({});

// Function to allow only letters in string fields
const onlyLetters = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^a-zA-Z\s]/g, ""); // Allow only letters and spaces
};

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, ""); // Allow only numbers
};

const ipInputHandler = (event: Event) => {
  const input = event.target as HTMLInputElement;
  // Allow numbers and dots, and remove other characters
  input.value = input.value.replace(/[^0-9.]/g, "");
  // Limit to max 128 characters
  if (input.value.length > 128) {
    input.value = input.value.slice(0, 128);
  }
};

// Form validation function
const validate = () => {
  errorBag.value = {};

  if (service.value) {
    // Validate only if enabled
    if (!name.value.trim() || name.value.length > 64) {
      errorBag.value.name =
        "Task name is required and must be max 64 characters.";
    }

    if (!destination.value.trim() || destination.value.length > 128) {
      errorBag.value.destination =
        "Destination is required and must be max 128 characters.";
    }

    const timeInt = Number(timeInterval.value);
    if (
      !timeInterval.value.trim() ||
      isNaN(timeInt) ||
      timeInt < 1 ||
      timeInt > 65535
    ) {
      errorBag.value.timeInterval =
        "Time Interval must be between 1 and 65535.";
    }

    const retryInt = Number(retryTimes.value);
    if (
      !retryTimes.value.trim() ||
      isNaN(retryInt) ||
      retryInt < 1 ||
      retryInt > 65535
    ) {
      errorBag.value.retryTimes = "Retry Times must be between 1 and 65535.";
    }

    // if (command.value.trim().toLowerCase() !== "reboot") {
    //     errorBag.value.command = "Command must be 'reboot'."
    // }

    if (!timeOutAction.value) {
      errorBag.value.timeOutAction = "Time out action is required'.";
    }

    if (!sourceInterface.value) {
      errorBag.value.sourceInterface = "Source interface is required'.";
    }

    if (!checkType.value) {
      errorBag.value.checkType = "Check type is required'.";
    }
  }

  return Object.keys(errorBag.value).length === 0;
};

// Save function
const saveRule = async () => {
  if (!validate()) return;
  loading.value.saveRule = true;

  try {
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

    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/performance_sla`,
      {
        method: "add-rule",
        payload,
      }
    );

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: Success,
        description: Saved,
        kind: "success",
      });
      loading.value.saveRule = false;

      emit("save", payload);
      emit("close"); // Close drawer on success
      emit("tunnel-added");
    }
  } catch (err) {
    loading.value.saveRule = false;
    console.error("Error saving rule:", getAxiosErrorMessage(err));
  }
  loading.value.saveRule = false;
};

// Close drawer function
const closeDrawer = () => {
  emit("close");
};
</script>

<template>
  <NeSideDrawer
    :isShown="isShown"
    title="Add Rule"
    closeAriaLabel="Close"
    @close="closeDrawer"
  >
    <form>
      <div class="space-y-6">
        <NeToggle
          v-model="ruleService"
          :label="ruleService ? 'Enable' : 'Disable'"
          :topLabel="'Service'"
        />

        <!-- Show form fields only if service is enabled -->
        <template v-if="ruleService">
          <NeTextInput
            @input="onlyLetters"
            v-model="ruleName"
            :invalidMessage="errorBag.ruleName"
            :label="t('Name')"
            :placeholder="t('Enter Name')"
          >
          </NeTextInput>

          <NeTextInput
            v-model="ruleSource"
            :invalidMessage="errorBag.ruleSource"
            :label="t('Source')"
            :placeholder="t('Enter Source')"
          >
          </NeTextInput>

          <NeTextInput
            v-model="ruleDestination"
            :invalidMessage="errorBag.ruleDestination"
            :label="t('Destination')"
            :placeholder="t('Enter Destination')"
          >
          </NeTextInput>

          <NeCombobox
            v-model="ruleProtocol"
            :options="[
              { label: 'tcp', id: 'tcp' },
              { label: 'udp', id: 'udp' },
              { label: 'any', id: 'any' },
            ]"
            :label="t('Protocol')"
            class="grow"
            :noResultsLabel="t('ne_combobox.no_results')"
            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
            :noOptionsLabel="t('ne_combobox.no_options_label')"
            :selected-label="t('ne_combobox.selected')"
            :user-input-label="t('ne_combobox.user_input_label')"
            :optionalLabel="t('common.optional')"
          />
          <span
            v-if="errorBag.ruleProtocol"
            style="color: rgb(190 18 60 / var(--tw-text-opacity))"
          >
            {{ errorBag.ruleProtocol }}
          </span>

          <NeTextInput
            @input="onlyNumbers"
            v-model="port"
            :invalidMessage="errorBag.port"
            :label="t('Port')"
            :placeholder="t('Enter port')"
          >
          </NeTextInput>

          <!-- Outgoing Mode Dropdown -->
          <NeCombobox
            v-model="outgoingMode"
            :options="outgoingModeOptions"
            :label="t('Outgoing Mode')"
            class="grow"
            value-key="id"
            label-key="label"
            :noResultsLabel="t('ne_combobox.no_results')"
            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
            :noOptionsLabel="t('ne_combobox.no_options_label')"
            :selected-label="t('ne_combobox.selected')"
            :user-input-label="t('ne_combobox.user_input_label')"
            :optionalLabel="t('common.optional')"
          />

          <!-- Manual Interface Input: Shown only if "manual" is selected -->
          <NeTextInput
            v-if="outgoingMode === 'manual'"
            v-model="manualInterface"
            :label="t('Manual Interface')"
            :placeholder="t('Enter interface name')"
            :invalidMessage="errorBag.manualInterface"
          />
        </template>
      </div>

      <!-- Footer -->
      <div class="mt-6 flex justify-end">
        <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
          Cancel
        </NeButton>
        <!-- Submit button (left aligned) -->
        <div class="flex w-[90px] flex-col">
          <NeButton
            class="ml-1"
            :disabled="loading.saveRule"
            :loading="loading.saveRule"
            kind="primary"
            size="lg"
            @click.prevent="saveRule()"
          >
            <template>
              <FontAwesomeIcon :icon="faSave" />
            </template>
            {{ t("common.save") }}
          </NeButton>
        </div>
      </div>
    </form>
  </NeSideDrawer>
</template>
