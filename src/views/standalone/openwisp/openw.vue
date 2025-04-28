<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FormLayout from '@/components/standalone/FormLayout.vue';
import { useNotificationsStore } from '@/stores/notifications';
import { NeToggle, NeTextInput, NeCheckbox, NeButton, NeCombobox, NeHeading, NeInlineNotification, NeTooltip } from '@nethesis/vue-components';
import axios from 'axios';
import { getSDControllerApiEndpoint } from '@/lib/config';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'


const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const status = ref(false);
const serverAddress = ref('');
const managementInterface = ref('wg0');
const sharedSecret = ref('');
const verifySSL = ref(false);
const loading = ref(false);
const saving = ref(false);
const error = ref({ title: '', description: '' });

onMounted(() => {
  fetchConfiguration();
});

async function fetchConfiguration() {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/sd_controller`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      const config = response.data.data;
      status.value = config.service === 'enable';
      serverAddress.value = config.url;
      managementInterface.value = config.management_interface;
      sharedSecret.value = config.shared_secret;
      verifySSL.value = config.verify_ssl === '1';
    }
  } catch (err) {
    error.value = { title: 'Error', description: 'Failed to fetch sd-controller configuration.' };
  } finally {
    loading.value = false;
  }
}
const interfaces = ref([
  { label: 'wg0', value: 'wg0' },
  { label: 'zt0', value: 'zt0' },
]);
async function saveSettings() {
  try {
    saving.value = true;
    // console.log("Selected Management Interface:", managementInterface.value); // Debugging

    const response = await axios.post(`${getSDControllerApiEndpoint()}/sd_controller`, {
      method: 'set-config',
      payload: {
        service: status.value ? 'enable' : 'disable',
        url: serverAddress.value,
        management_interface: managementInterface.value,
        shared_secret: sharedSecret.value,
        verify_ssl: verifySSL.value ? '1' : '0'
      }
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'Configuration saved successfully.',
        kind: 'success'
      });
    } else {
      throw new Error('Failed to save configuration.');
    }
  } catch (err) {
    console.error("Error:", err);
    error.value = { title: 'Error', description: 'Failed to save OpenWISP configuration.' };
  } finally {
    saving.value = false;
  }
}

</script>

<template>
  <NeHeading tag="h3" class="mb-4">{{ t('SDWAN Controller') }}</NeHeading>

  <FormLayout :description="t('Enable or disable sd controller and adjust its settings.')">
    <NeInlineNotification v-if="error.title" class="my-4" kind="error" :title="error.title"
      :description="error.description" />

    <!-- Toggle also controls form visibility -->
    <NeToggle v-model="status" :topLabel="t('Status')" :label="status ? 'Enabled' : 'Disabled'" />

    <div v-if="status" class="mt-4 flex flex-col gap-y-3">
      <NeTextInput v-model="serverAddress" :label="t('Server Address')" :placeholder="t('Enter Server Address')">
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t('standalone.logs.search_tooltip') }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>
      <!-- <NeTextInput v-model="serverAddress" label="Server Address" /> -->

      <label for="">Interface</label>
      <select v-model="managementInterface" style="width: 100%;
    height: 36px;
    
    padding: 6px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.3s ease-in-out;">
        <option disabled value="">Select Interface</option>
        <option v-for="iface in interfaces" :key="iface.value" :value="iface.value">
          {{ iface.label }}
        </option>
      </select>

      <NeTextInput v-model="sharedSecret" :label="t('Secret')" type="password" :placeholder="t('Enter Secret')">
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t('standalone.logs.search_tooltip') }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>
      <!-- <NeTextInput v-model="sharedSecret" label="Secret" type="password" /> -->

      <!-- TLS Verify Row -->
      <div class="flex items-center  mt-4">
        <NeCheckbox v-model="verifySSL" :label="t('TLS Verify')" id="tls-verify" />
      </div>

      <!-- <label for="TLS Verify">TLS Verify</label>
      <NeTextInput v-model="verifySSL" type="checkbox"
        class="w-4 h-4 border-gray-300 rounded text-primary-600 focus:ring-primary-600 dark:border-gray-700 dark:text-primary-600 dark:focus:ring-primary-400" /> -->
    </div>

    <NeButton class="mt-5 ml-1" :disabled="saving" :loading="saving" kind="primary" size="lg"
      @click.prevent="saveSettings()">
      <template #prefix>
        <FontAwesomeIcon :icon="faSave" />
      </template>
      {{ t('common.save') }}
    </NeButton>

    <!-- <NeButton :loading="saving" kind="primary" @click="saveSettings" class="mt-5 ml-1">Save</NeButton> -->

  </FormLayout>
</template>
