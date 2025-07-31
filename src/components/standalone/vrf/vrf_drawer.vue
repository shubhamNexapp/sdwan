<script setup lang="ts">
import {
  NeSideDrawer,
  NeButton,
  NeTextInput,
  NeToggle,
  getAxiosErrorMessage,
  NeTooltip,
  NeCombobox,
} from "@nethesis/vue-components";
import { onMounted, ref, watch } from "vue";
import { useNotificationsStore } from "../../../stores/notifications";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const props = defineProps({
  isShown: { type: Boolean, default: false },
});

const emit = defineEmits(["close", "save", "tunnel-added"]);

const loading = ref({
  saveRule: false,
  fetchRule: false,
});

const service = ref(false);
const name = ref("");
const id = ref("");
const bindInterfaceName = ref("");
const bindMode = ref("lan");
const network = ref("");
const gateway = ref("");

const interfaceOptions = ref([]);
const errorBag = ref<{ [key: string]: string }>({});
const apiResponse = ref();

onMounted(() => {
  getLists();
});

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/vrf`, {
      method: "get-config",
      payload: {},
    });
    if (response.data.code === 200) {
      apiResponse.value = response.data.data;
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

watch(
  () => apiResponse.value,
  (newValue) => {
    if (newValue) {
      interfaceOptions.value = (newValue.up_interface || []).map(
        (item: any) => ({
          label: item.ifname,
          id: item.ifname,
        })
      );
    }
  },
  { immediate: true }
);

const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9]/g, "");
};

const validate = () => {
  errorBag.value = {};

  if (service.value) {
    if (!name.value.trim() || name.value.length > 32) {
      errorBag.value.name = "Name is required and must be max 32 characters.";
    }

    if (!bindInterfaceName.value.trim()) {
      errorBag.value.bindInterfaceName = "Interface name is required.";
    }

    if (!network.value.trim()) {
      errorBag.value.network = "Network is required.";
    }

    if (bindMode.value === "wan" && !gateway.value.trim()) {
      errorBag.value.gateway = "Gateway is required when bind mode is WAN.";
    }
  }

  return Object.keys(errorBag.value).length === 0;
};

const saveRule = async () => {
  if (!validate()) return;

  const payload = {
    service: service.value ? "enable" : "disable",
    name: name.value,
    bind_ifname: bindInterfaceName.value,
    bind_mode: bindMode.value,
    network: network.value,
    gateway: bindMode.value === "wan" ? gateway.value : "",
  };

  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/vrf`, {
      method: "add-config",
      payload,
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: "Configuration saved successfully.",
        kind: "success",
      });

      emit("save", payload);
      emit("close");
      emit("tunnel-added");
    }
  } catch (err) {
    console.error("Error saving rule:", getAxiosErrorMessage(err));
  }
};

const closeDrawer = () => {
  emit("close");
};
</script>

<template>
  <NeSideDrawer
    :isShown="isShown"
    title="Add VRF"
    closeAriaLabel="Close"
    @close="closeDrawer"
  >
    <form @submit.prevent="saveRule">
      <div class="space-y-6">
        <NeToggle
          v-model="service"
          :label="service ? 'Enable' : 'Disable'"
          :topLabel="'Service'"
        />

        <template v-if="service">
          <NeTextInput
            v-model.trim="name"
            :label="t('Name')"
            :placeholder="t('Enter Name')"
            :invalidMessage="errorBag.name"
          >
            <template >
              <NeTooltip>
                <template>{{
                  t("Enter the interface name")
                }}</template>
              </NeTooltip>
            </template>
          </NeTextInput>

          <!-- Bind Mode -->
          <NeCombobox
            v-model="bindMode"
            :options="[
              { label: 'LAN', id: 'lan' },
              { label: 'WAN', id: 'wan' },
            ]"
            :label="t('Bind Mode')"
          />

          <!-- Interface Name -->
          <NeCombobox
            v-model="bindInterfaceName"
            :options="interfaceOptions"
            :label="t('Interface Name')"
            :invalidMessage="errorBag.bindInterfaceName"
          />

          <!-- Network -->
          <NeTextInput
            v-model.trim="network"
            :label="t('Network')"
            :placeholder="'e.g. 192.168.1.0/24'"
            :invalidMessage="errorBag.network"
          />

          <!-- Gateway (only if bind_mode === 'wan') -->
          <NeTextInput
            v-if="bindMode === 'wan'"
            v-model.trim="gateway"
            :label="t('Gateway')"
            :placeholder="'e.g. 192.168.1.1'"
            :invalidMessage="errorBag.gateway"
          />
        </template>
      </div>

      <div class="mt-6 flex justify-end">
        <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3"
          >Cancel</NeButton
        >
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
