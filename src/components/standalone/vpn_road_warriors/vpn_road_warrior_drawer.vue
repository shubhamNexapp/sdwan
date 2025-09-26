<script setup lang="ts">
import {
  NeInlineNotification,
  NeSideDrawer,
  NeButton,
  NeTextInput,
  NeToggle,
  NeDropdown,
  getAxiosErrorMessage,
  NeTooltip,
  NeCombobox,
} from "@nethesis/vue-components";
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import axios from "axios";
import { useNotificationsStore } from "../../../stores/notifications";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

const notificationsStore = useNotificationsStore();
const { t } = useI18n();

const props = defineProps({
  isShown: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "save", "tunnel-added"]);

// Form fields
const service = ref(false);
const taskName = ref("");
const command = ref("");
const mode = ref("");
const week = ref("");
const month = ref("");
const day = ref("");
const startTime = ref("");
const endTime = ref("");
const year = ref("");
const interval = ref("");
const action = ref("");

let loading = ref({
  listServiceSuggestions: false,
  listObjectSuggestions: false,
  listProtocols: false,
  saveRule: false,
  fetchRule: false,
});

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({});

// Mode options for dropdown
const modeOptions = [
  { value: "range", label: "Range" },
  { value: "interval", label: "Interval" },
];

// Computed property to check selected mode and show respective fields
const showRangeFields = computed(() => mode.value === "range");
const showIntervalField = computed(() => mode.value === "interval");

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, ""); // Allow only numbers
};

// Form validation function
const validate = () => {
  errorBag.value = {};

  if (service.value) {
    // Validate only if enabled

    if (!taskName.value.trim() || taskName.value.length > 64) {
      errorBag.value.taskName =
        "Task name is required and must be max 64 characters.";
    }

    if (!command.value) {
      errorBag.value.command = "Command is required";
    }

    if (!mode.value.trim()) {
      errorBag.value.mode = "Mode is required.";
    }

    if (showRangeFields.value) {
      // const weekNumber = Number(week.value.trim());
      const dayNumber = Number(day.value.trim());
      const yearNumber = Number(year.value.trim());

      if (startTime.value >= endTime.value) {
        errorBag.value.startTime = "Start time must be earlier than end time.";
      }

      if (!day.value.trim()) {
        errorBag.value.day = "Day is required.";
      } else if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
        errorBag.value.day = "Day must be a number between 1 and 31.";
      }

      if (!month.value.trim()) {
        errorBag.value.month = "Month is required.";
      }

      if (!year.value.trim()) {
        errorBag.value.year = "Year is required.";
      } else if (isNaN(yearNumber) || yearNumber < 2000 || yearNumber > 2999) {
        errorBag.value.year = "Year must be a number between 2000 and 2999.";
      } else {
        errorBag.value.year = ""; // clear error if valid
      }
    }

    if (showIntervalField.value) {
      const intervalNumber = Number(interval.value.trim());

      if (!interval.value.trim()) {
        errorBag.value.interval = "Interval is required.";
      } else if (
        isNaN(intervalNumber) ||
        intervalNumber < 1 ||
        intervalNumber > 1440
      ) {
        errorBag.value.interval =
          "The interval time between command execution must be between 1 and 1440.";
      }
    }
  }

  // ❗ Clean up errorBag: Remove keys with empty values
  for (const key in errorBag.value) {
    if (!errorBag.value[key]) {
      delete errorBag.value[key];
    }
  }

  return Object.keys(errorBag.value).length === 0;
};

// Save function
const saveRule = async () => {
  if (!validate()) return;

  try {
    const clockData = `${startTime.value}-${endTime.value}`;

    const rule = {
      name: taskName.value,
      service: service.value ? "enable" : "disable",
      task_type: command.value,
      ...(command.value === "custom" && { action: action.value }),
      time_mode: mode.value,
      ...(showRangeFields.value && {
        clock: clockData,
        month: month.value ?? "*",
        day: day.value ?? "*",
        year: year.value ?? "*",
      }),
      ...(showIntervalField.value && {
        time_interval: interval.value,
      }),
    };

    const payload = {
      method: "set-config",
      payload: [rule], // wrapped inside an array
    };

    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/schedule`,
      payload
    );

    if (response.status === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: "Configuration saved successfully.",
        kind: "success",
      });

      emit("save", payload);
      emit("close"); // Close drawer on success
      emit("tunnel-added"); // <--- EMIT after successful added
    }
  } catch (err) {
    console.error("Error saving rule:", getAxiosErrorMessage(err));
  }
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
      <!-- Status -->
      <NeToggle
        class="mb-4"
        v-model="service"
        :label="service ? 'Enable' : 'Disable'"
        :topLabel="'Service'"
      />

      <template v-if="service">
        <div class="space-y-6">
          <!-- Task Name -->
          <NeTextInput
            class="mt-4"
            v-model.trim="taskName"
            :invalidMessage="errorBag.taskName"
            :label="t('Task Name')"
            :placeholder="t('Enter Task Name')"
          >
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t("Enter the task name") }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>

          <NeCombobox
            v-model="command"
            :options="[
              { label: 'Custom', id: 'custom' },
              { label: 'Reboot', id: 'reboot' },
            ]"
            :label="t('Task Type')"
            class="grow"
            :noResultsLabel="t('ne_combobox.no_results')"
            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
            :noOptionsLabel="t('ne_combobox.no_options_label')"
            :selected-label="t('ne_combobox.selected')"
            :user-input-label="t('ne_combobox.user_input_label')"
            :optionalLabel="t('common.optional')"
          />
          <p
            v-if="errorBag.command"
            class="mt-1 text-sm"
            style="color: rgba(190, 18, 60, 0.9)"
          >
            {{ errorBag.command }}
          </p>

          <!-- Task Name -->
          <NeTextInput
            v-if="command === 'custom'"
            class="mt-4"
            v-model.trim="action"
            :invalidMessage="errorBag.action"
            :label="t('Action')"
            :placeholder="t('Enter Action')"
          >
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t("Enter the task name") }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>

          <NeCombobox
            v-model="mode"
            :options="[
              { label: 'Range', id: 'range' },
              { label: 'Interval', id: 'interval' },
            ]"
            :label="t('Time Type')"
            class="grow"
            :noResultsLabel="t('ne_combobox.no_results')"
            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
            :noOptionsLabel="t('ne_combobox.no_options_label')"
            :selected-label="t('ne_combobox.selected')"
            :user-input-label="t('ne_combobox.user_input_label')"
            :optionalLabel="t('common.optional')"
          />
          <br />
          <!-- Display error manually -->
          <span
            v-if="errorBag.mode"
            style="color: rgb(190 18 60 / var(--tw-text-opacity))"
          >
            {{ errorBag.mode }}
          </span>
          <!-- Fields for "Range" mode -->
          <template v-if="showRangeFields">
            <div class="clock-container">
              <label class="clock-label">Clock:</label>

              <div class="clock-inputs">
                <input
                  type="time"
                  v-model="startTime"
                  min="00:00"
                  max="23:59"
                  required
                  class="time-input"
                />

                <span class="dash">-</span>

                <input
                  type="time"
                  v-model="endTime"
                  min="00:00"
                  max="23:59"
                  required
                  class="time-input"
                />
              </div>
            </div>

            <p v-if="errorBag.startTime" class="error-text">
              {{ errorBag.startTime }}
            </p>

            <NeTextInput
              v-model.trim="day"
              :invalidMessage="errorBag.day"
              :label="t('Day')"
              :placeholder="t('Enter Day')"
            >
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t("Enter day") }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>

            <NeCombobox
              v-model="month"
              :options="[
                { label: 'Jan', id: 'Jan' },
                { label: 'Feb', id: 'Feb' },
                { label: 'Mar', id: 'Mar' },
                { label: 'Apr', id: 'Apr' },
                { label: 'May', id: 'May' },
                { label: 'Jun', id: 'Jun' },
                { label: 'Jul', id: 'Jul' },
                { label: 'Aug', id: 'Aug' },
                { label: 'Sep', id: 'Sep' },
                { label: 'Oct', id: 'Oct' },
                { label: 'Noc', id: 'Noc' },
                { label: 'Dec', id: 'Dec' },
              ]"
              :label="t('Month')"
              class="grow"
              :noResultsLabel="t('ne_combobox.no_results')"
              :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
              :noOptionsLabel="t('ne_combobox.no_options_label')"
              :selected-label="t('ne_combobox.selected')"
              :user-input-label="t('ne_combobox.user_input_label')"
              :optionalLabel="t('common.optional')"
            />
            <p
              v-if="errorBag.month"
              class="text-sm"
              style="color: rgba(190, 18, 60, 0.9)"
            >
              {{ errorBag.month }}
            </p>
            <!-- <NeTextInput label="Month" v-model.trim="month" :invalidMessage="errorBag.month" /> -->

            <NeTextInput
              v-model.trim="year"
              :invalidMessage="errorBag.year"
              :label="t('Year')"
              :placeholder="t('Enter Year')"
            >
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t("Enter year") }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>
          </template>

          <!-- Field for "Interval" mode -->
          <NeTextInput
            v-if="showIntervalField"
            class="mt-4"
            @input="onlyNumbers"
            v-model.trim="interval"
            :invalidMessage="errorBag.interval"
            :label="t('Interval')"
            :placeholder="t('Enter Interval')"
          >
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t("Enter the interval time") }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput v-if="showIntervalField" @input="onlyNumbers" label="Interval" v-model.trim="interval"
                        :invalidMessage="errorBag.interval" /> -->
        </div>
      </template>
      <!-- Footer -->
      <div class="mt-6 flex justify-end">
        <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
          Cancel
        </NeButton>
        <!-- Submit button (left aligned) -->
          <NeButton
            class="ml-1"
            :disabled="loading.saveRule"
            :loading="loading.saveRule"
            kind="primary"
            size="lg"
            @click.prevent="saveRule()"
          >
            <template #prefix>
              <FontAwesomeIcon :icon="faSave" />
            </template>
            {{ t("common.save") }}
          </NeButton>
      </div>
    </form>
  </NeSideDrawer>
</template>

<style>
.clock-container {
  display: flex;
  align-items: center;
  margin-top: 1rem;
}

.clock-label {
  margin-right: 1rem;
  font-weight: 500;
  min-width: 60px;
}

.clock-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.time-input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  font-size: 14px;
  width: 120px;
}

.time-input:focus {
  border-color: #409eff;
}

.dash {
  margin: 0 4px;
  font-weight: bold;
}

.error-text {
  color: rgba(190, 18, 60, 0.9);
  font-size: 0.875rem;
  margin-top: 4px;
}
</style>
