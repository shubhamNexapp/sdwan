<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import FormLayout from "@/components/standalone/FormLayout.vue";
import { useNotificationsStore } from "@/stores/notifications";
import {
  NeToggle,
  NeTextInput,
  NeButton,
  NeCombobox,
  NeHeading,
  NeInlineNotification,
  NeTooltip,
} from "@nethesis/vue-components";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { Saved, Success } from "@/lib/tost";

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const loading = ref(false);
const saving = ref(false);
const error = ref({ title: "", description: "" });

// form fields
const service = ref(false);
const status = ref("");
const role = ref("primary"); // default role
const primaryNodeIp = ref("");
const backupNodeIp = ref("");
const virtualIp = ref("");
const wanIfname = ref("");
const wanVirtualIp = ref("");
const wanGateway = ref("");
const backupPassword = ref("");

// fetch config
onMounted(() => {
  fetchConfiguration();
});

async function fetchConfiguration() {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ns_ha`, {
      method: "get-config",
      payload: {},
    });

    if (response.data.code === 200) {
      const config = response.data.data;

      service.value = config.service === "enable";
      status.value = config.status;
      role.value = config.role;
      primaryNodeIp.value = config.primary_node_ip;
      backupNodeIp.value = config.backup_node_ip;
      virtualIp.value = config.virtual_ip;
      wanIfname.value = config.wan_ifname;
      wanVirtualIp.value = config.wan_virtual_ip;
      wanGateway.value = config.wan_gateway;
      backupPassword.value = config.backup_password;
    }
  } catch (err) {
    error.value = {
      title: "Error",
      description: "Failed to fetch configuration.",
    };
  } finally {
    loading.value = false;
  }
}

const sshPassword = ref("");

const errorBag = ref<{ [key: string]: string }>({});

// regex to validate CIDR (ip/mask)
const cidrRegex =
  /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}\/(3[0-2]|[12]?\d)$/;

function validate() {
  errorBag.value = {};

  if (role.value === "primary") {
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
    if (!backupPassword.value || backupPassword.value.length > 32)
      errorBag.value.backupPassword = "Password required (max 32 chars)";
  }
  return Object.keys(errorBag.value).length === 0;
}

async function saveSettings() {
  try {
    if (!validate()) return;
    saving.value = true;
    const payload: any = {
      service: service.value ? "enable" : "disable",
      status: status.value,
      role: role.value,
    };

    if (role.value === "primary") {
      // include all fields only if primary
      payload.primary_node_ip = primaryNodeIp.value;
      payload.backup_node_ip = backupNodeIp.value;
      payload.virtual_ip = virtualIp.value;
      payload.wan_ifname = wanIfname.value;
      payload.wan_virtual_ip = wanVirtualIp.value;
      payload.wan_gateway = wanGateway.value;
      payload.backup_password = backupPassword.value;
    }

    const response = await axios.post(`${getSDControllerApiEndpoint()}/ns_ha`, {
      method: "set-config",
      payload,
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: Success,
        description: Saved,
        kind: "success",
      });
      fetchConfiguration();
    } else {
      throw new Error("Failed to save configuration.");
    }
  } catch (err) {
    console.error("Error:", err);
    error.value = {
      title: "Error",
      description: "Failed to save configuration.",
    };
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <NeHeading tag="h3" class="mb-4">{{
    t("High Availability Configuration")
  }}</NeHeading>

  <FormLayout
    :description="
      t('Enable or disable High Availability and adjust its settings.')
    "
  >
    <NeInlineNotification
      v-if="error.title"
      class="my-4"
      kind="error"
      :title="error.title"
      :description="error.description"
    />

    <!-- Toggle service -->
    <NeToggle
      v-model="service"
      :topLabel="t('Service')"
      :label="service ? 'Enable' : 'Disable'"
    />

    <template v-if="service">
      <div class="mt-4">
        <p>
          <strong class="mr-2">Status :</strong>
          <span
            :class="status === 'primary' ? 'text-green-500' : 'text-red-500'"
          >
            {{ status }}
          </span>
        </p>
      </div>

      <!-- Role Dropdown -->
      <NeCombobox
        v-model="role"
        :options="[
          { label: 'Primary', id: 'primary' },
          { label: 'Backup', id: 'backup' },
        ]"
        :label="t('Role')"
        class="mt-4"
      />

      <!-- Common fields (always visible) -->

      <!-- Extra fields only when role = primary -->
      <div v-if="role === 'primary'" class="mt-4 flex flex-col gap-y-3">
        <NeTextInput
          v-model="primaryNodeIp"
          :label="t('Primary Node IP')"
          placeholder="192.168.1.1"
          :invalidMessage="errorBag.primaryNodeIp"
        />
        <NeTextInput
          v-model="backupNodeIp"
          :label="t('Backup Node IP')"
          placeholder="192.168.1.2"
          :invalidMessage="errorBag.backupNodeIp"
        />
        <NeTextInput
          v-model="virtualIp"
          :label="t('Virtual IP')"
          placeholder="192.168.1.4/24"
          :invalidMessage="errorBag.virtualIp"
        >
          <template>
            <NeTooltip>
              <template>
                {{
                  t("Enter the virtual IP with subnet (e.g. 192.168.1.4/24)")
                }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>

        <NeTextInput
          v-model="wanIfname"
          :label="t('WAN Interface Name')"
          placeholder="eth1"
          :invalidMessage="errorBag.wanIfname"
        />
        <NeTextInput
          v-model="wanVirtualIp"
          :label="t('WAN Virtual IP')"
          placeholder="192.168.40.1/24"
          :invalidMessage="errorBag.wanVirtualIp"
        />
        <NeTextInput
          v-model="wanGateway"
          :label="t('WAN Gateway')"
          placeholder="192.168.40.1"
          :invalidMessage="errorBag.wanGateway"
        />
        <NeTextInput
          type="password"
          v-model="backupPassword"
          :label="t('Backup Password')"
          placeholder="Enter Backup Password"
          :invalidMessage="errorBag.backupPassword"
        />
      </div>
    </template>

    <!-- Save Button -->
    <NeButton
      class="ml-1 mt-5"
      :disabled="saving"
      :loading="saving"
      kind="primary"
      size="lg"
      @click.prevent="saveSettings()"
    >
                 <FontAwesomeIcon :icon="['fas', 'floppy-disk']" aria-hidden="true" class="mr-2" />

      {{ t("common.save") }}
    </NeButton>
  </FormLayout>
</template>
