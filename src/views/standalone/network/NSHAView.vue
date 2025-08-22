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
const role = ref("");
const primaryNodeIp = ref("");
const backupNodeIp = ref("");
const virtualIp = ref("");
const wanIfname = ref("");
const wanVirtualIp = ref("");
const wanGateway = ref("");
const backupPassword = ref("");

// fetch existing config
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

async function saveSettings() {
  try {
    saving.value = true;
    const payload = {
      service: service.value ? "enable" : "disable",
      status: status.value,
      role: role.value,
      primary_node_ip: primaryNodeIp.value,
      backup_node_ip: backupNodeIp.value,
      virtual_ip: virtualIp.value,
      wan_ifname: wanIfname.value,
      wan_virtual_ip: wanVirtualIp.value,
      wan_gateway: wanGateway.value,
      backup_password: backupPassword.value,
    };

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
  <NeHeading tag="h3" class="mb-4">{{ t("NS-HA Configuration") }}</NeHeading>

  <FormLayout
    :description="t('Enable or disable NS-HA and adjust its settings.')"
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

    <div v-if="service" class="mt-4 flex flex-col gap-y-3">
      <p>
        <strong>Status :</strong>
        <span :class="status === 'primary' ? 'text-green-500' : 'text-red-500'">
          {{ status }}
        </span>
      </p>
      <p><strong>Role :</strong> {{ role }}</p>

      <NeTextInput
        v-model="primaryNodeIp"
        :label="t('Primary Node IP')"
        placeholder="192.168.1.1"
      />
      <NeTextInput
        v-model="backupNodeIp"
        :label="t('Backup Node IP')"
        placeholder="192.168.1.2"
      />
      <NeTextInput
        v-model="virtualIp"
        :label="t('Virtual IP')"
        placeholder="192.168.1.4/24"
      >
        <template>
          <NeTooltip>
            <template>
              {{ t("Enter the virtual IP with subnet (e.g. 192.168.1.4/24)") }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>

      <NeCombobox
        v-model="wanIfname"
        :options="[
          { label: 'eth0', id: 'eth0' },
          { label: 'eth1', id: 'eth1' },
        ]"
        :label="t('WAN Interface')"
        class="grow"
      />

      <NeTextInput
        v-model="wanVirtualIp"
        :label="t('WAN Virtual IP')"
        placeholder="192.168.40.1/24"
      />
      <NeTextInput
        v-model="wanGateway"
        :label="t('WAN Gateway')"
        placeholder="192.168.40.1"
      />
      <NeTextInput
        type="password"
        v-model="backupPassword"
        :label="t('Backup Password')"
        placeholder="Enter Backup Password"
      />
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
  </FormLayout>
</template>
