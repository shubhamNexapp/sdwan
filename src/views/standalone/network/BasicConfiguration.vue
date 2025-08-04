<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useNotificationsStore } from "@/stores/notifications";
import {
  NeToggle,
  NeTextInput,
  NeButton,
  NeCombobox,
  NeInlineNotification,
} from "@nethesis/vue-components";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Saved, Success } from "@/lib/tost";

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({});
const participantOptions = ref<{ label: string; id: string }[]>([]);
const baseOptions = ref();

const loading = ref(false);
const saving = ref(false);
const service = ref(false);

const name = ref("");

const protocol = ref("");
// const participant = ref("");
const participant = ref<{ id: string; label: string }[]>([]);

const server = ref("");
const slaTarget = ref(false);
const latencyThreshold = ref("");
const jitterThreshold = ref("");
const checkInterval = ref("");
const failuresBeforeInactive = ref("");
const restoreLinkAfter = ref("");
const packetLoss = ref("");

const interfaceName = ref("");

const error = ref({ title: "", description: "" });

onMounted(() => {
  fetchConfiguration();
});

async function fetchConfiguration() {
  try {
    loading.value = true;
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/performance_sla`,
      {
        method: "get-config",
        payload: {},
      }
    );

    if (response.data.code === 200) {
      const config = response.data.data;

      service.value = config.service === "enable";
      protocol.value = config.base_protocol;
      participant.value = config.allreay_zone;
      server.value = config.base_server;
      slaTarget.value = config.sla_target === "enable";
      latencyThreshold.value = config.sla_latency;
      jitterThreshold.value = config.sla_jitter;
      checkInterval.value = config.sla_check_interval;
      failuresBeforeInactive.value = config.sla_fail_interval;
      restoreLinkAfter.value = config.sla_restore_interval;
      packetLoss.value = config.sla_packet_loss;

      // Get unique values from "up_ifname"
      const uniqueIfnames = [...new Set(config.zone_ifname as string[])];

      // Format for NeCombobox
      participantOptions.value = uniqueIfnames.map((ifname) => ({
        label: ifname,
        id: ifname,
      }));

      baseOptions.value = [...new Set(config.base_particpants as string[])];
    }
  } catch (err) {
    // error.value = {
    //   title: "Error",
    //   description: "Failed to fetch configuration.",
    // };
  } finally {
    loading.value = false;
  }
}

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, ""); // Allow only numbers
};

// Form validation function
const validate = () => {
  errorBag.value = {}; // Clear previous errors

  if (service.value) {
    // Required: protocol
    if (!protocol.value) {
      errorBag.value.protocol = "Protocol is required.";
    }

    // Required: base_participant (same as base_server)
    if (!participant.value) {
      errorBag.value.participant = "Participant is required.";
    } else if (participant.value.length > 64) {
      errorBag.value.participant =
        "Participant must be less than 64 characters.";
    }

    // Required: server (same as base_server)
    if (!server.value) {
      errorBag.value.server = "Server is required.";
    } else if (server.value.length > 64) {
      errorBag.value.server = "Server must be less than 64 characters.";
    }

    // Optional numeric range validations (0–65535)
    const validateRangeField = (value: string, field: string) => {
      if (value !== "") {
        const num = Number(value);
        if (isNaN(num) || num < 0 || num > 65535) {
          errorBag.value[
            field
          ] = `${field} must be a number between 0 and 65535.`;
        }
      }
    };

    validateRangeField(latencyThreshold.value, "latencyThreshold");
    validateRangeField(jitterThreshold.value, "jitterThreshold");
    validateRangeField(checkInterval.value, "checkInterval");
    validateRangeField(failuresBeforeInactive.value, "failuresBeforeInactive");
    validateRangeField(restoreLinkAfter.value, "restoreLinkAfter");
  }

  return Object.keys(errorBag.value).length === 0;
};

async function saveSettings() {
  // if (!validate()) return;

  try {
    saving.value = true;

    const payload = {
      update_static_route: service.value ? "enable" : "disable",
      zone_name: name.value,
      zone_ifname: interfaceName.value,
      base_protocol: protocol.value,
      base_particpants: participant.value.map((item) => item.id),
      base_server: server.value,
      sla_target: slaTarget.value ? "enable" : "disable",
      sla_latency: latencyThreshold.value,
      sla_jitter: jitterThreshold.value,
      sla_check_interval: checkInterval.value,
      sla_fail_interval: failuresBeforeInactive.value,
      sla_restore_interval: restoreLinkAfter.value,
      sla_packet_loss: packetLoss.value,
    };
    console.log("payload========", payload);
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/performance_sla`,
      {
        method: "set-base",
        payload: payload,
      }
    );

    if (response.data.code === 200) {
      saving.value = false;
      notificationsStore.createNotification({
        title: Success,
        description: Saved,
        kind: "success",
      });
      fetchConfiguration();
    } else {
      saving.value = false;
      throw new Error("Failed to save configuration.");
    }
  } catch (err) {
    saving.value = false;
    console.error("Error:", err);
    // error.value = {
    //   title: "Error",
    //   description: "Failed to save SDWAN Controller configuration.",
    // };
  } finally {
    saving.value = false;
  }
}

const showLatency = ref(true);
const showJitter = ref(true);
const showPacketLoss = ref(true);

const validateRangeField = (value: string) => {
  if (!value.trim()) {
    return "Range value is required";
  }
  // Add additional logic if needed
  return "";
};

if (showLatency.value) {
  validateRangeField(latencyThreshold.value);
}
// if (showJitter.value) {
//   validateRangeField(jitterThreshold.value, "jitterThreshold");
// }
// if (showPacketLoss.value) {
//   validateRangeField(packetLoss.value, "packetLoss");
// }
</script>

<template>
  <NeInlineNotification
    v-if="error.title"
    class=""
    kind="error"
    :title="error.title"
    :description="error.description"
  />

  <!-- Toggle also controls form visibility -->
  <NeToggle
    v-model="service"
    :topLabel="t('Service')"
    :label="service ? 'Enable' : 'Disable'"
  />

  <div v-if="service" class="mt-4 flex flex-col gap-y-3">
    <NeCombobox
      v-model="protocol"
      :options="[
        { label: 'ping', id: 'ping' },
        { label: 'http', id: 'http' },
        { label: 'dns', id: 'dns' },
      ]"
      :label="t('Protocol')"
      class="grow"
    />

    <p
      v-if="errorBag.protocol"
      class="text-sm"
      style="color: rgba(190, 18, 60, 0.9)"
    >
      {{ errorBag.protocol }}
    </p>

    <NeCombobox
      multiple
      v-model="participant"
      :options="participantOptions"
      value-key="id"
      label-key="label"
      :label="$t('Participants')"
      class="grow"
      :noResultsLabel="$t('ne_combobox.no_results')"
      :limitedOptionsLabel="$t('ne_combobox.limited_options_label')"
      :noOptionsLabel="$t('ne_combobox.no_options_label')"
      :selected-label="$t('ne_combobox.selected')"
      :user-input-label="$t('ne_combobox.user_input_label')"
      :optionalLabel="$t('common.optional')"
    />

    <!-- Display the selected values in a clean array -->
    <p class="mt-2 flex flex-wrap gap-2 text-gray-700">
      <span
        v-for="(item, index) in baseOptions"
        :key="index"
        class="me-2 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
      >
        {{ typeof item === "object" ? item.label : item }}
      </span>
    </p>

    <!-- <NeTextInput
      v-model="participant"
      :label="t('Base Participant')"
      :placeholder="t('Enter participant')"
      :maxLength="64"
      :invalidMessage="errorBag.participant"
    /> -->

    <NeTextInput
      v-model="server"
      :label="t('Server')"
      :placeholder="t('Enter server')"
      :invalidMessage="errorBag.server"
    />

    <NeToggle
      v-model="slaTarget"
      :topLabel="t('SLA Target')"
      :label="slaTarget ? t('Enabled') : t('Disabled')"
      :invalidMessage="errorBag.slaTarget"
    />

    <!-- Threshold Configuration -->
    <div class="grid grid-cols-12 gap-x-6 gap-y-4">
      <!-- Latency Threshold -->
      <div class="col-span-12 flex items-center">
        <label class="w-1/4 font-medium">{{
          t("Latency Threshold (ms)")
        }}</label>
        <NeToggle
          class="mr-4"
          v-model="showLatency"
          :label="showLatency ? t('Enabled') : t('Disabled')"
        />
        <NeTextInput
          class="w-1/3"
          v-model="latencyThreshold"
          :placeholder="t('Enter latency in ms')"
          :invalidMessage="errorBag.latencyThreshold"
          :disabled="!showLatency"
          @input="onlyNumbers"
        />
      </div>

      <!-- Jitter Threshold -->
      <div class="col-span-12 flex items-center">
        <label class="w-1/4 font-medium">{{
          t("Jitter Threshold (ms)")
        }}</label>
        <NeToggle
          class="mr-4"
          v-model="showJitter"
          :label="showJitter ? t('Enabled') : t('Disabled')"
        />
        <NeTextInput
          class="w-1/3"
          v-model="jitterThreshold"
          :placeholder="t('Enter jitter in ms')"
          :invalidMessage="errorBag.jitterThreshold"
          :disabled="!showJitter"
          @input="onlyNumbers"
        />
      </div>

      <!-- Packet Loss -->
      <div class="col-span-12 flex items-center">
        <label class="w-1/4 font-medium">{{ t("Packet Loss (%)") }}</label>
        <NeToggle
          class="mr-4"
          v-model="showPacketLoss"
          :label="showPacketLoss ? t('Enabled') : t('Disabled')"
        />
        <NeTextInput
          class="w-1/3"
          v-model="packetLoss"
          :placeholder="t('Enter packet loss')"
          :invalidMessage="errorBag.packetLoss"
          :disabled="!showPacketLoss"
          @input="onlyNumbers"
        />
      </div>
    </div>

    <!-- <NeTextInput
      v-model="jitterThreshold"
      :label="t('Jitter Threshold (ms)')"
      :placeholder="t('Enter jitter in ms')"
      :invalidMessage="errorBag.jitterThreshold"
      @input="onlyNumbers"
    /> -->

    <NeTextInput
      v-model="checkInterval"
      :label="t('Check Interval (s)')"
      :placeholder="t('Enter interval in seconds')"
      :invalidMessage="errorBag.checkInterval"
      @input="onlyNumbers"
    />

    <NeTextInput
      v-model="failuresBeforeInactive"
      :label="t('Failures Before Inactive')"
      :placeholder="t('Enter failure count')"
      :invalidMessage="errorBag.failuresBeforeInactive"
      :invalid="!!errorBag.failuresBeforeInactive"
      @input="onlyNumbers"
    />

    <NeTextInput
      v-model="restoreLinkAfter"
      :label="t('Restore Link After (s)')"
      :placeholder="t('Enter restore time in seconds')"
      :invalidMessage="errorBag.restoreLinkAfter"
      @input="onlyNumbers"
    />

    <!-- <NeTextInput
      v-model="packetLoss"
      :label="t('Packet Loss')"
      :placeholder="t('Enter packet loss')"
      :invalidMessage="errorBag.packetLoss"
      @input="onlyNumbers"
    /> -->
  </div>

  <NeButton
    class="ml-1 mt-5"
    :disabled="saving"
    :loading="saving"
    kind="primary"
    size="lg"
    @click.prevent="saveSettings()"
  >
    <template>
      <FontAwesomeIcon :icon="faSave" />
    </template>
    {{ t("common.save") }}
  </NeButton>
</template>
