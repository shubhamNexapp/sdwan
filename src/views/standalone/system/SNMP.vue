<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { getSDControllerApiEndpoint } from '@/lib/config';
import { useNotificationsStore } from '@/stores/notifications';
import FormLayout from '@/components/standalone/FormLayout.vue';
import {
  NeToggle,
  NeTextInput,
  NeButton, NeHeading, NeTooltip, NeCombobox
} from '@nethesis/vue-components';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { Saved, Success } from '@/lib/tost';

const { t } = useI18n();
const notificationsStore = useNotificationsStore();

const service = ref(false);
const snmpVersion = ref('2c');
const loading = ref(false);
const saving = ref(false);
const errorBag = ref<{ [key: string]: string }>({});

const loadingNew = ref({ saveRule: false })

const community = ref('');
const port = ref('');
const trapIp = ref('');
const trapPort = ref('');
const clientaddr = ref('');

const snmp3port = ref('');
const username = ref('');
const password = ref('');
const hash = ref('');
const encryption = ref('');
const encryptionKey = ref('');

onMounted(fetchConfiguration);

async function fetchConfiguration() {
  try {
    loading.value = true;
    const res = await axios.post(`${getSDControllerApiEndpoint()}/snmp`, {
      method: 'get-config',
      payload: {}
    });

    if (res.data.code === 200) {
      const config = res.data.data;
      service.value = config.service === 'enable';
      snmpVersion.value = config.version || '2c';

      if (snmpVersion.value === '2c' && config.snmpv2) {
        community.value = config.snmpv2.community || '';
        port.value = config.snmpv2.port || '';
        trapIp.value = config.snmpv2.trap_ip || '';
        trapPort.value = config.snmpv2.trap_port || '';
        clientaddr.value = config.snmpv2.clientaddr || '';
      }

      if (snmpVersion.value === '3' && config.snmpv3?.account?.[0]) {
        const acc = config.snmpv3.account[0];
        username.value = acc.username || '';
        password.value = acc.password || '';
        hash.value = acc.hash || '';
        encryption.value = acc.encrypt || '';
        encryptionKey.value = acc.key || '';
        snmp3port.value = config.snmpv3.port || '';
        clientaddr.value = config.snmpv3.clientaddr || '';
      }
    }
  } catch {
    console.error('Fetch failed');
  } finally {
    loading.value = false;
  }
}

function validate(): boolean {
  errorBag.value = {};

  const isRequired = (val: any) => typeof val === 'string' && val.trim() !== '';

  const isPortValid = (val: string) =>
    /^\d+$/.test(val) && Number(val) >= 1 && Number(val) <= 65535;

  const isStrLen = (val: string, max: number) =>
    isRequired(val) && val.length <= max;

  const isStrLenRange = (val: string, min: number, max: number) =>
    isRequired(val) && val.length >= min && val.length <= max;

  const isValidIPv4 = (val: string) =>
    /^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.|$)){4}$/.test(val);

  if (!['2c', '3'].includes(snmpVersion.value)) {
    errorBag.value.snmpVersion = 'Invalid SNMP version';
  }

  if (snmpVersion.value === '2c') {
    if (!isPortValid(port.value)) errorBag.value.port = 'Port must be 1–65535';
    if (!isStrLen(community.value, 32)) errorBag.value.community = 'Max 32 characters';
    if (!isValidIPv4(trapIp.value)) errorBag.value.trapIp = 'Invalid IP address';
    if (!isPortValid(trapPort.value)) errorBag.value.trapPort = 'Trap port must be 1–65535';
  }

  if (snmpVersion.value === '3') {
    if (!isPortValid(snmp3port.value)) errorBag.value.snmp3port = 'Port must be 1–65535';
    if (!isValidIPv4(clientaddr.value)) errorBag.value.clientaddr = 'Invalid IP address';
    if (!isRequired(username.value)) {
      errorBag.value.username = 'Username is required';
    } else if (!isStrLen(username.value, 32)) {
      errorBag.value.username = 'Max 32 characters';
    }

    if (!isRequired(password.value)) {
      errorBag.value.password = 'Password is required';
    } else if (!isStrLen(password.value, 32)) {
      errorBag.value.password = 'Max 32 characters';
    }
    if (!hash.value) errorBag.value.hash = 'Hash is required';
    if (!encryption.value) errorBag.value.encryption = 'Encryption is required';
    if (!isStrLenRange(encryptionKey.value, 8, 32))
      errorBag.value.encryptionKey = 'Length must be 8–32 characters';
  }
  return Object.keys(errorBag.value).length === 0;
}

async function saveSettings() {
  if (!validate()) return;

  loadingNew.value.saveRule = true

  try {
    saving.value = true;
    const payload: any = {
      service: service.value ? 'enable' : 'disable',
      version: snmpVersion.value
    };

    if (snmpVersion.value === '2c') {
      payload.snmpv2 = {
        community: community.value,
        port: port.value,
        trap_ip: trapIp.value,
        trap_port: trapPort.value,
        clientaddr: clientaddr.value
      };
    }

    if (snmpVersion.value === '3') {
      payload.snmpv3 = {
        port: snmp3port.value,
        clientaddr: clientaddr.value,
        account: [{
          username: username.value,
          password: password.value,
          hash: hash.value,
          encrypt: encryption.value,
          key: encryptionKey.value
        }]
      };
    }

    const res = await axios.post(`${getSDControllerApiEndpoint()}/snmp`, {
      method: 'set-config',
      payload
    });

    if (res.data.code === 200) {
      notificationsStore.createNotification({
        title: Success,
        description: Saved,
        kind: 'success'
      });
      loadingNew.value.saveRule = false
    } else {
      loadingNew.value.saveRule = false
      throw new Error('Server error');
    }
  } catch (err) {
    notificationsStore.createNotification({
      title: 'Error',
      description: 'Failed to save settings',
      kind: 'danger'
    });
    loadingNew.value.saveRule = false
  } finally {
    saving.value = false;
    loadingNew.value.saveRule = false
  }
  loadingNew.value.saveRule = false
}
</script>

<template>

  <NeHeading tag="h3" class="mb-4">{{ t('SNMP') }}</NeHeading>

  <FormLayout
    :description="t('Configure SNMP settings, including version selection, user account details, and encryption for secure network management.')">

    <NeToggle v-model="service" :topLabel="t('Service')" :label="service ? 'Enable' : 'Disable'" />

    <div v-if="service" class="mt-4 flex flex-col gap-y-3">

      <div class="my-4">
        <NeCombobox v-model="snmpVersion" :options="[
          { label: '2c', id: '2c' },
          { label: '3', id: '3' }
        ]" :label="t('SNMP Version')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
          :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
          :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
          :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />

        <!-- <label class="block font-medium mb-1">SNMP Version</label>
        <select v-model="snmpVersion" class="border rounded px-3 py-2 w-full">
          <option value="2c">2c</option>
          <option value="3">3</option>
        </select> -->
      </div>

      <!-- SNMPv2 Section -->

      <template v-if="snmpVersion === '2c'">
        <div class="mb-4">
          <NeTextInput v-model="port" :invalidMessage="errorBag.port" :label="t('Port')"
            :placeholder="t('Enter Port Number')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the configured SNMP port number') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
        </div>
        <!-- <NeTextInput v-model="port" :label="t('Port')" :invalidMessage="errorBag.port" /> -->

        <div class="mb-4">
          <NeTextInput v-model="community" :invalidMessage="errorBag.community" :label="t('Community')"
            :placeholder="t('Enter Community')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the community secret') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
        </div>
        <!-- <NeTextInput v-model="community" :label="t('Community')" :invalidMessage="errorBag.community" /> -->

        <div class="mb-4">
          <NeTextInput v-model="trapIp" :invalidMessage="errorBag.trapIp" :label="t('Trap IP')"
            :placeholder="t('Enter Trap IP')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the Trap IP of server') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
        </div>
        <!-- <NeTextInput v-model="trapIp" :label="t('Trap IP')" :invalidMessage="errorBag.trapIp" /> -->

        <div class="mb-4">
          <NeTextInput v-model="trapPort" :invalidMessage="errorBag.trapPort" :label="t('Trap Port')"
            :placeholder="t('Enter Trap Port')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the configured TRAP port number') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
        </div>
        <!-- <NeTextInput v-model="trapPort" :label="t('Trap Port')" :invalidMessage="errorBag.trapPort" /> -->
      </template>

      <!-- SNMPv3 Section -->
      <template v-else>
        <div class="mb-4"></div>
        <NeTextInput v-model="snmp3port" :invalidMessage="errorBag.snmp3port" :label="t('Port')"
          :placeholder="t('Enter Port')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('Enter the configured SNMP port number') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput v-model="snmp3port" :label="t('Port')" :invalidMessage="errorBag.snmp3port" /> -->

        <div class="mb-4"></div>
        <NeTextInput v-model="clientaddr" :invalidMessage="errorBag.clientaddr" :label="t('Trap IP')"
          :placeholder="t('Enter Trap IP')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('Enter the configured TRAP IP') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput v-model="clientaddr" :label="t('Trap IP')" :invalidMessage="errorBag.clientaddr" /> -->

        <div class="mb-4"></div>
        <NeTextInput v-model="username" :invalidMessage="errorBag.username" :label="t('Username')"
          :placeholder="t('Enter Username')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('Enter the SNMPv3 username that is configured on your SNMP manager.') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput v-model="username" :label="t('Username')" :invalidMessage="errorBag.username" /> -->

        <div class="mb-4"></div>
        <NeTextInput v-model="password" :invalidMessage="errorBag.password" :label="t('Password')"
          :placeholder="t('Enter Password')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('Enter the SNMPv3 password that is configured on your SNMP manager.') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput v-model="password" :label="t('Password')" :invalidMessage="errorBag.password" /> -->

        <div class="my-4">
          <NeCombobox v-model="hash" :options="[
            { label: 'MD5', id: 'MD5' },
            { label: 'SHA', id: 'SHA' }
          ]" :label="t('Hash')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
            :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
            :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />
          <p v-if="errorBag.hash" class="text-sm mt-1" style="color: rgba(190, 18, 60, 0.9);">
            {{ errorBag.hash }}
          </p>
          <!-- <label class="block font-medium mb-1">Hash</label>
          <select v-model="hash" class="border rounded px-3 py-2 w-full">
            <option value="MD5">MD5</option>
            <option value="SHA">SHA</option>
          </select> -->
        </div>

        <div class="my-4">
          <NeCombobox v-model="encryption" :options="[
            { label: 'AES', id: 'AES' },
            { label: 'DES', id: 'DES' }
          ]" :label="t('Encrypt')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
            :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
            :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />
          <p v-if="errorBag.encryption" class="text-sm mt-1" style="color: rgba(190, 18, 60, 0.9);">
            {{ errorBag.encryption }}
          </p>
          <!-- <label class="block font-medium mb-1">Encrypt</label>
          <select v-model="encryption" class="border rounded px-3 py-2 w-full">
            <option value="AES">AES</option>
            <option value="DES">DES</option>
          </select> -->
        </div>

        <NeTextInput v-model="encryptionKey" :invalidMessage="errorBag.encryptionKey" :label="t('Encryption Key')"
          :placeholder="t('Enter Encryption Key')">
          <template #tooltip>
            <NeTooltip>
              <template #content>
                {{ t('Enter the privacy password used to encrypt SNMP data traffic.') }}
              </template>
            </NeTooltip>
          </template>
        </NeTextInput>
        <!-- <NeTextInput v-model="encryptionKey" :label="t('Encryption Key')" :invalidMessage="errorBag.encryptionKey" /> -->
      </template>

      <!-- Save Button -->
      <!-- <div class="mt-6">
        <NeButton :loading="saving" @click="saveSettings">
          {{ t('Save') }}
        </NeButton>
      </div> -->

    </div>

    <NeButton class="mt-5 ml-1" :disabled="loadingNew.saveRule" :loading="loadingNew.saveRule" kind="primary" size="lg"
      @click.prevent="saveSettings()">
        <FontAwesomeIcon :icon="['fas', 'floppy-disk']" aria-hidden="true" class="mr-2" />
      {{ t('common.save') }}
    </NeButton>
  </FormLayout>

</template>
