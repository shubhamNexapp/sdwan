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
const interfaceOptions = ref<{ label: string; id: string }[]>([]);
const zoneOptionsShow = ref<{ label: string; id: string }[]>([]);

const loading = ref(false);
const saving = ref(false);
const service = ref(false);

const name = ref("");
const interfaceName = ref<{ id: string; label: string }[]>([]);

const error = ref({ title: "", description: "" });

onMounted(() => {
  fetchConfiguration();
});

const zoneUniqueIfnames = ref();

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
      name.value = config.zone_name;
      interfaceName.value = config.up_ifname;

      // Get unique values from "zone_ifname"
      const uniqueIfnames = [...new Set(config.up_ifname as string[])];

      // Format for NeCombobox
      interfaceOptions.value = uniqueIfnames.map((ifname) => ({
        label: ifname,
        id: ifname,
      }));

      zoneUniqueIfnames.value = [...new Set(config.zone_ifname as string[])];
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

async function saveSettings() {
  try {
    saving.value = true;

    const selectedInterface = interfaceName.value; // Or from interfaceName.value

    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/performance_sla`,
      {
        method: "set-zone",
        payload: {
          service: service.value ? "enable" : "disable",
          zone_name: name.value,
          zone_ifname: interfaceName.value.map((item) => item.id),
        },
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
    <NeTextInput
      v-model="name"
      :label="t('Name')"
      :placeholder="t('Enter Name')"
    >
    </NeTextInput>

    <NeCombobox
      multiple
      v-model="interfaceName"
      :options="interfaceOptions"
      value-key="id"
      label-key="label"
      :label="$t('Interface Name')"
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
        v-for="(item, index) in zoneUniqueIfnames"
        :key="index"
        class="me-2 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800"
      >
        {{ typeof item === "object" ? item.label : item }}
      </span>
    </p>
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
