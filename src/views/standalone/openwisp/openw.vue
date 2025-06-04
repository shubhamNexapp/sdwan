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

const serverAddress = ref('');
const managementInterface = ref('wg0');
const sharedSecret = ref('');
const verifySSL = ref(false);
const loading = ref(false);
const saving = ref(false);

const status = ref(false);
const service = ref(false);
const model = ref("");


const mainManagementInterface = ref('');
const mainSharedSecret = ref('');
const mainUrl = ref('');
const mainVerifySSL = ref(false);

const backupManagementInterface = ref('');
const backupSharedSecret = ref('');
const backupUrl = ref('');
const backupVerifySSL = ref(false);


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

      service.value = config.service === 'enable';
      status.value = config.status === 'connected';
      model.value = config.model

      mainManagementInterface.value = config.main.management_interface
      mainSharedSecret.value = config.main.shared_secret
      mainUrl.value = config.main.url
      mainVerifySSL.value = config.main.verify_ssl === "1" 

      backupManagementInterface.value = config.backup.management_interface
      backupSharedSecret.value = config.backup.shared_secret
      backupUrl.value = config.backup.url
      backupVerifySSL.value = config.backup.verify_ssl === "1"
    }
  } catch (err) {
    error.value = { title: 'Error', description: 'Failed to fetch sd-controller configuration.' };
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  try {
    saving.value = true;
    // console.log("Selected Management Interface:", managementInterface.value); // Debugging

    const response = await axios.post(`${getSDControllerApiEndpoint()}/sd_controller`, {
      method: 'set-config',
      payload: {
        service: service.value ? 'enable' : 'disable',
        "main": {
          "management_interface": mainManagementInterface.value,
          "shared_secret": mainSharedSecret.value,
          "url": mainUrl.value,
          "verify_ssl": mainVerifySSL.value ? "1" : "0"
        },
        "backup": {
          "management_interface": backupManagementInterface.value,
          "shared_secret": backupSharedSecret.value,
          "url": backupUrl.value,
          "verify_ssl": backupVerifySSL.value ? "1" : "0"
        }
      }
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'Configuration saved successfully.',
        kind: 'success'
      });
      fetchConfiguration()
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
    <NeToggle v-model="service" :topLabel="t('Service')" :label="service ? 'Enable' : 'Disable'" />


    <div v-if="service" class="mt-4 flex flex-col gap-y-3">


      <p>
        <strong>Status :</strong>
        <span :class="status ? 'text-green-500' : 'text-red-500'"> {{ }}
          {{ status ? 'Connected' : 'Disconnected' }}
        </span>
      </p>
      <p><strong>Mode :</strong> {{ model }}</p>


      <p class="max-w-2xl font-bold text-black dark:text-gray-400 mt-2">Main</p>

      <NeCombobox v-model="mainManagementInterface" :options="[
        { label: 'wg0', id: 'wg0' },
        { label: 'zt0', id: 'zt0' }
      ]" :label="t('Managemnet Interface')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
        :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
        :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
        :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />

      <NeTextInput v-model="mainSharedSecret" :label="t('Shared Secret')" :placeholder="t('Enter Shared Secret')">
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t('standalone.logs.search_tooltip') }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>

      <NeTextInput v-model="mainUrl" :label="t('URL')" :placeholder="t('Enter URL')">
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t('standalone.logs.search_tooltip') }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>

      <!-- <NeCombobox v-model="mainVerifySSL" :options="[
        { label: '0', id: '0' },
        { label: '1', id: '1' }
      ]" :label="t('Verify SSL')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
        :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
        :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
        :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" /> -->

      <NeCheckbox v-model="mainVerifySSL" :label="t('Verify SSL')" />

      <p class="max-w-2xl font-bold text-black dark:text-gray-400 mt-4">Backup</p>

      <div class="mt-4 flex flex-col gap-y-3">

        <NeCombobox v-model="backupManagementInterface" :options="[
          { label: 'wg0', id: 'wg0' },
          { label: 'zt0', id: 'zt0' }
        ]" :label="t('Managemnet Interface')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
          :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
          :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
          :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />

        <NeTextInput v-model="backupSharedSecret" :label="t('Shared Secret')" :placeholder="t('Enter Shared Secret')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>

        <NeTextInput v-model="backupUrl" :label="t('URL')" :placeholder="t('Enter URL')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('standalone.logs.search_tooltip') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>

        <!-- <NeCombobox v-model="backupVerifySSL" :options="[
          { label: '0', id: '0' },
          { label: '1', id: '1' }
        ]" :label="t('Verify SSL')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
          :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
          :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
          :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" /> -->

        <NeCheckbox v-model="backupVerifySSL" :label="t('Verify SSL')" />

      </div>

    </div>



    <NeButton class="mt-5 ml-1" :disabled="saving" :loading="saving" kind="primary" size="lg"
      @click.prevent="saveSettings()">
      <template #prefix>
        <FontAwesomeIcon :icon="faSave" />
      </template>
      {{ t('common.save') }}
    </NeButton>

  </FormLayout>
</template>
