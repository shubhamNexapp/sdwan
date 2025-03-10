<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FormLayout from '@/components/standalone/FormLayout.vue';
import { useNotificationsStore } from '@/stores/notifications';
import { NeToggle, NeTextInput, NeButton, NeInlineNotification } from '@nethesis/vue-components';
import axios from 'axios';
import { getSDControllerApiEndpoint } from '@/lib/config';

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
  <FormLayout class="max-w-4xl">
    <template #description>
      <p>{{ t('TACACS+ Configuration') }}</p>
    </template>

    <NeInlineNotification v-if="error.title" class="my-4" kind="error" :title="error.title"
      :description="error.description" />

    <NeToggle v-model="status" :topLabel="t('Status')" :label="status ? 'Enabled' : 'Disabled'" />

    <div v-if="status" class="flex flex-col gap-y-3">
      <NeTextInput v-model="serverAddress" label="Server Address" />
      <NeTextInput v-model="sharedSecret" label="Secret" type="password" />
    </div>
    <NeButton :loading="saving" kind="primary" @click="saveSettings" class="mt-5 ml-1">Save</NeButton>

  </FormLayout>
</template>
