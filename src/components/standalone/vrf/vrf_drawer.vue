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
import { onMounted, ref, watch, type PropType } from "vue";
import { useNotificationsStore } from "../../../stores/notifications";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave, faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

export type VRFRule = {
  name: string;
  service: string;
  bind_ifname: string;
  route: { network: string; via: string; dev: string }[];
  status: string;
};

const props = defineProps({
  isShown: { type: Boolean, default: false },
  itemToEdit: { type: Object as PropType<VRFRule | null>, default: null }, // ✅ Typed correctly
});

const emit = defineEmits(["close", "save", "tunnel-added"]);

const loading = ref({ saveRule: false });
const service = ref(false);
const name = ref("");
const sourceInterface = ref("");
const routes = ref<{ network: string; via: string; dev: string }[]>([]);
const sourceInterfaceOptions = ref<{ label: string; id: string }[]>([]);
const errorBag = ref<{ [key: string]: string }>({});
const apiResponse = ref();

onMounted(() => {
  getLists();
  if (props.itemToEdit) preload(props.itemToEdit);
});

watch(
  () => props.itemToEdit,
  (newVal) => {
    if (newVal) preload(newVal);
  },
  { immediate: true }
);

const preload = (rule: any) => {
  service.value = rule.service === "enable";
  name.value = rule.name || "";
  sourceInterface.value = rule.bind_ifname || "";
  routes.value = rule.route?.length
    ? JSON.parse(JSON.stringify(rule.route))
    : [{ network: "", via: "", dev: "" }];
};

const getLists = async () => {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/vrf`, {
      method: "get-config",
      payload: {},
    });
    if (response.data.code === 200) {
      apiResponse.value = response.data.data;
      if (response?.data?.data?.up_interface) {
        sourceInterfaceOptions.value = response.data.data.up_interface.map(
          (iface: { ifname: string }) => ({
            label: iface.ifname,
            id: iface.ifname,
          })
        );
      }
    }
  } catch (err) {
    console.error("Error fetching data:", err);
  }
};

const addRoute = () => routes.value.push({ network: "", via: "", dev: "" });
const removeRoute = (index: number) => routes.value.splice(index, 1);

const validate = () => {
  errorBag.value = {};
  if (service.value) {
    if (!name.value.trim()) errorBag.value.name = "Name is required.";
    if (!sourceInterface.value.trim())
      errorBag.value.sourceInterface = "Interface is required.";
    routes.value.forEach((r, idx) => {
      if (!r.network)
        errorBag.value[`route_network_${idx}`] = "Network required.";
      if (!r.via) errorBag.value[`route_via_${idx}`] = "Via required.";
      if (!r.dev) errorBag.value[`route_dev_${idx}`] = "Dev required.";
    });
  }
  return Object.keys(errorBag.value).length === 0;
};

const saveRule = async () => {
  if (!validate()) return;

  const payload = {
    service: service.value ? "enable" : "disable",
    name: name.value,
    bind_ifname: sourceInterface.value,
    route: routes.value,
  };

  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/vrf`, {
      method: props.itemToEdit ? "edit-config" : "add-config",
      payload,
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: props.itemToEdit
          ? "Configuration updated."
          : "Configuration saved.",
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

const closeDrawer = () => emit("close");
</script>

<template>
  <NeSideDrawer :isShown="isShown" :title="props.itemToEdit ? 'Edit VRF' : 'Add VRF'" closeAriaLabel="Close"
    @close="closeDrawer">
    <form @submit.prevent="saveRule">
      <div class="space-y-6">
        <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />
        <template v-if="service">
          <NeTextInput v-model.trim="name" :label="t('Name')" placeholder="Enter Name"
            :invalidMessage="errorBag.name" />

          <NeCombobox v-model="sourceInterface" :options="sourceInterfaceOptions" :label="t('Interface Name')"
            class="grow" />
          <span v-if="errorBag.sourceInterface" class="text-sm text-red-600">{{
            errorBag.sourceInterface
          }}</span>

          <div class="mt-6 rounded-md border p-4">
            <h3 class="mb-2 font-semibold">Route Table</h3>
            <div v-for="(route, index) in routes" :key="index" class="mb-3 flex gap-2">
              <NeTextInput v-model.trim="route.network" label="Network" placeholder="192.168.1.0/24"
                :invalidMessage="errorBag[`route_network_${index}`]" class="grow" />
              <NeTextInput v-model.trim="route.via" label="Via" placeholder="192.168.1.1"
                :invalidMessage="errorBag[`route_via_${index}`]" class="grow" />
              <NeTextInput v-model.trim="route.dev" label="Dev" placeholder="br1"
                :invalidMessage="errorBag[`route_dev_${index}`]" class="grow" />
              <NeButton kind="tertiary" size="sm" @click.prevent="removeRoute(index)" v-if="routes.length > 1">
                <FontAwesomeIcon :icon="faTrash" />
              </NeButton>
            </div>
            <NeButton kind="secondary" size="sm" @click.prevent="addRoute">
              <FontAwesomeIcon :icon="faPlus" class="mr-1" /> Add Route
            </NeButton>
          </div>
        </template>
      </div>
      <div class="mt-6 flex justify-end">
        <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">Cancel</NeButton>
        <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
          @click.prevent="saveRule()">
          <FontAwesomeIcon :icon="['fas', 'floppy-disk']" aria-hidden="true" class="mr-2" />
          {{ t("common.save") }}
        </NeButton>
      </div>
    </form>
  </NeSideDrawer>
</template>
