<script setup lang="ts">
import {
  NeSideDrawer,
  NeButton,
  NeTextInput,
  NeCombobox,
  NeToggle,
} from "@nethesis/vue-components";
import { ref } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";

const props = defineProps<{
  isShown: boolean;
  config: any;
}>();

const emit = defineEmits(["close", "save"]);

const service = ref(props.config?.service || "enable");
const status = ref(props.config?.status || "primary");
const role = ref(props.config?.role || "primary");
const primaryNodeIp = ref(props.config?.primary_node_ip || "");
const backupNodeIp = ref(props.config?.backup_node_ip || "");
const virtualIp = ref(props.config?.virtual_ip || "");
const wanIfname = ref(props.config?.wan_ifname || "");
const wanVirtualIp = ref(props.config?.wan_virtual_ip || "");
const wanGateway = ref(props.config?.wan_gateway || "");
const pubbkey = ref(props.config?.pubbkey || "");
const password = ref(props.config?.password || "");
const sshPassword = ref(props.config?.ssh_password || "");

const errorBag = ref<{ [key: string]: string }>({});

// allow only digits, dot, slash
function restrictInput(event: Event) {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, "");
}

// regex to validate CIDR (ip/mask)
const cidrRegex =
  /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}\/(3[0-2]|[12]?\d)$/;

function validate() {
  errorBag.value = {};
  if (!primaryNodeIp.value || primaryNodeIp.value.length > 128)
    errorBag.value.primaryNodeIp = "Primary Node IP required (max 128 chars)";
  if (!backupNodeIp.value || backupNodeIp.value.length > 128)
    errorBag.value.backupNodeIp = "Backup Node IP required (max 128 chars)";
  if (!virtualIp.value || virtualIp.value.length > 128)
    errorBag.value.virtualIp = "Virtual IP required (max 128 chars)";
  if (!wanIfname.value || wanIfname.value.length > 16)
    errorBag.value.wanIfname = "WAN Interface Name required (max 16 chars)";
  if (!wanVirtualIp.value) {
    errorBag.value.wanVirtualIp = "WAN Virtual IP is required";
  } else if (!cidrRegex.test(wanVirtualIp.value)) {
    errorBag.value.wanVirtualIp = "Must be in format 192.168.40.100/24";
  }
  if (!wanGateway.value || wanGateway.value.length > 128)
    errorBag.value.wanGateway = "WAN Gateway required (max 128 chars)";
  if (!sshPassword.value || sshPassword.value.length > 32)
    errorBag.value.sshPassword = "SSH Password required (max 32 chars)";
  return Object.keys(errorBag.value).length === 0;
}

async function saveConfig() {
  if (!validate()) return;
  const payload = {
    service: service.value,
    status: status.value,
    role: role.value,
    primary_node_ip: primaryNodeIp.value,
    backup_node_ip: backupNodeIp.value,
    virtual_ip: virtualIp.value,
    wan_ifname: wanIfname.value,
    wan_virtual_ip: wanVirtualIp.value,
    wan_gateway: wanGateway.value,
    pubbkey: pubbkey.value,
    password: password.value,
    ssh_password: sshPassword.value,
  };

  await axios.post(`${getSDControllerApiEndpoint()}/ns_ha`, {
    method: "set-config",
    payload,
  });

  emit("save");
  emit("close");
}
</script>

<template>
  <NeSideDrawer :isShown="isShown" title="Add NS-HA" @close="emit('close')">
    <div class="space-y-4">
      <NeCombobox
        v-model="service"
        :options="[
          { label: 'Enable', id: 'enable' },
          { label: 'Disable', id: 'disable' },
        ]"
        label="Service"
      />

      <p>
        <strong>Status :</strong>
        <span :class="status === 'primary' ? 'text-green-500' : 'text-red-500'">
          {{ status.toUpperCase() }}
        </span>
      </p>

      <NeCombobox
        v-model="role"
        :options="[{ label: 'Primary', id: 'primary' }]"
        label="Role"
      />
      <NeTextInput
        v-model.trim="primaryNodeIp"
        label="Primary Node IP"
        :invalidMessage="errorBag.primaryNodeIp"
      />
      <NeTextInput
        v-model.trim="backupNodeIp"
        label="Backup Node IP"
        :invalidMessage="errorBag.backupNodeIp"
      />
      <NeTextInput
        v-model.trim="virtualIp"
        label="Virtual IP"
        :invalidMessage="errorBag.virtualIp"
      />
      <NeTextInput
        v-model.trim="wanIfname"
        label="WAN Interface Name"
        :invalidMessage="errorBag.wanIfname"
      />
      <!-- WAN Virtual IP -->
      <NeTextInput
        v-model.trim="wanVirtualIp"
        label="WAN Virtual IP"
        placeholder="192.168.40.100/24"
        :invalidMessage="errorBag.wanVirtualIp"
        @input="restrictInput"
      />
      <NeTextInput
        v-model.trim="wanGateway"
        label="WAN Gateway"
        :invalidMessage="errorBag.wanGateway"
      />
      <NeTextInput
        v-model.trim="sshPassword"
        label="Backup Password"
        :type="'password'"
        :invalidMessage="errorBag.sshPassword"
      />
    </div>

    <div class="mt-6 flex justify-end">
      <NeButton kind="tertiary" @click="emit('close')">Cancel</NeButton>
      <NeButton kind="primary" class="ml-2" @click="saveConfig">Save</NeButton>
    </div>
  </NeSideDrawer>
</template>
