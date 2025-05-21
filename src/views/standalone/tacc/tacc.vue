<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FormLayout from '@/components/standalone/FormLayout.vue';
import { useNotificationsStore } from '@/stores/notifications';
import { NeToggle, NeTextInput, NeButton, NeInlineNotification, NeHeading, NeTooltip, } from '@nethesis/vue-components';
import axios from 'axios';
import { getSDControllerApiEndpoint } from '@/lib/config';

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const status = ref(false);
const serverAddress = ref('');
const sharedSecret = ref('');
const loading = ref(false);
const saving = ref(false);
const error = ref({ title: '', description: '' });

onMounted(() => {
  fetchConfiguration();
});

async function fetchConfiguration() {
  try {
    loading.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/tacc`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      const config = response.data.data;
      status.value = config.service === 'enable';
      serverAddress.value = config.server;
      sharedSecret.value = config.secret;
    }
  } catch (err) {
    error.value = { title: 'Error', description: 'Failed to fetch TACACS+ configuration.' };
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  try {
    saving.value = true;
    const response = await axios.post(`${getSDControllerApiEndpoint()}/tacc`, {
      method: 'set-config',
      payload: {
        service: status.value ? 'enable' : 'disable',
        server: serverAddress.value,
        secret: sharedSecret.value
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
    error.value = { title: 'Error', description: 'Failed to save TACACS+ configuration.' };
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <NeHeading tag="h3" class="mb-4">{{ t('TACACS+ Configuration') }}</NeHeading>


        <FormLayout :description="t('Enable or disable Tacacs ++ configuration and adjust its settings.')">
          <NeToggle class="mb-4" v-model="status" :topLabel="t('Status')" :label="status ? 'Enable' : 'Disable'" />

          <div v-if="status" class="space-y-4">
            <NeTextInput v-model="serverAddress" :label="t('Server Address')" :placeholder="t('Enter Server Address')">
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t('standalone.hotspot.settings.login_helper_username') }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>
            <!-- <NeTextInput class="mt-4" v-model="serverAddress" label="Server Address">
              <NeTooltip>
                <template #content>
                  {{ t('standalone.hotspot.settings.login_helper_username') }}
                </template>
              </NeTooltip>
            </NeTextInput> -->

            <NeTextInput type="password" v-model="sharedSecret" :label="t('Secret')" :placeholder="t('Enter Secret')">
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t('standalone.hotspot.settings.login_helper_username') }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>
            <!-- <NeTextInput v-model="sharedSecret" label="Secret" type="password" /> -->
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
