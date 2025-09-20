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

export type TopologyRule = {
  service: string;
  name: string;
  topology_type: string;
};

const emit = defineEmits(["close", "save", "tunnel-added"]);

const loading = ref({ saveRule: false });
const service = ref(false);
const name = ref("");
const topologyType = ref("");

const topologyOptions = [
          { label: 'IPSEC', id: 'IPSEC' },
          { label: 'ZEROTIER', id: 'ZEROTIER' }
        ]

const errorBag = ref<{ [key: string]: string }>({});

// Validation
const validate = () => {
  errorBag.value = {};
  if (!name.value.trim()) errorBag.value.name = "Name is required.";
  if (!topologyType.value.trim()) errorBag.value.topologyType = "Topology is required.";
  return Object.keys(errorBag.value).length === 0;
};

// Save
const saveRule = async () => {
  if (!validate()) return;

  const payload =[ {
    service: service.value ? "enable" : "disable",
    name: name.value,
    topology_type: topologyType.value,
  }];

  try {
    loading.value.saveRule = true;
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/topology`,
      {
        method: "set-config",
        payload,
      }
    );

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description:"Configuration saved.",
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
  <NeSideDrawer :isShown="isShown" :title="'Add Topology'"
    closeAriaLabel="Close" @close="closeDrawer">
    <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />
    <div v-if="service" class="mt-4 flex flex-col gap-y-3">
    <form @submit.prevent="saveRule">
      <div class="space-y-6">
        <!-- Service Toggle -->

         <!--  Name -->
        <NeTextInput v-model.trim="name" :label="t('Name')" placeholder="Enter Name"
          :invalidMessage="errorBag.name" />

        <!-- Interface -->
        <NeCombobox v-model="topologyType" :options="topologyOptions" :label="t('Interface Name')"
          class="grow" />
        <span v-if="errorBag.topologyType" class="text-sm text-red-600">
          {{ errorBag.topologyType }}
        </span>
      </div>

      
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
    </div>
  </NeSideDrawer>
</template>
