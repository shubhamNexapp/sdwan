<script setup lang="ts">
import {
  NeHeading,
  NeButton,
  NeTextInput,
  NeToggle,
  getAxiosErrorMessage,
  NeTooltip
} from '@nethesis/vue-components'
import FormLayout from '@/components/standalone/FormLayout.vue';
import { onMounted, ref } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const notificationsStore = useNotificationsStore()

const { t } = useI18n();

const emit = defineEmits(['close', 'save'])

let loading = ref({
  listServiceSuggestions: false,
  listObjectSuggestions: false,
  listProtocols: false,
  saveRule: false,
  fetchRule: false,
});

// Form fields
const service = ref(false)
const acsUrl = ref("")
const acsUsername = ref("")
const acsPassword = ref("")
const cpeUsername = ref("")
const cpePassword = ref("")
const enableInterval = ref(false)
const interval = ref("")

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({})

// Function to allow only letters in string fields
const onlyLetters = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^a-zA-Z\s]/g, '') // Allow only letters and spaces
}

const allowPasswordChars = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/g, '');
};


// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^0-9]/g, '') // Allow only numbers
}

const onlyValidUrlCharacters = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^a-zA-Z0-9:\/\.\-\_]/g, '')
}

// Form validation function
const validate = () => {
  errorBag.value = {}

  if (service.value) { // Validate only if enabled

    if (!acsUrl.value.trim() || acsUrl.value.length > 64) {
      errorBag.value.acsUrl = "Acs url is required and must be max 64 characters."
    }

    if (!acsUsername.value.trim() || acsUsername.value.length > 32) {
      errorBag.value.acsUsername = "Acs username is required and must be max 32 characters."
    }

    if (!acsPassword.value.trim() || acsPassword.value.length > 32) {
      errorBag.value.acsPassword = "Acs password is required and must be max 32 characters."
    }

  }

  return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
  if (!validate()) return

  try {
    const payload = {
      service: service.value ? "enable" : "disable",
      acs_url: acsUrl.value,
      acs_username: acsUsername.value,
      acs_password: acsPassword.value,
      cpe_username: cpeUsername.value,
      cpe_password: cpePassword.value,
      enable_interval: enableInterval.value ? "enable" : "disable",
      interval: interval.value
    }

    const response = await axios.post(`${getSDControllerApiEndpoint()}/tr069`, {
      method: "set-config",
      payload,
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: 'Success',
        description: 'Configuration saved successfully.',
        kind: 'success'
      })

      emit('save', payload)
    }
  } catch (err) {
    console.error("Error saving rule:", getAxiosErrorMessage(err))
  }
}

// Close drawer function
const closeDrawer = () => {
  emit('close')
}

onMounted(() => {
  getLists()
})

let apiResponse = ref()
const getLists = async () => {

  try {

    const response = await axios.post(`${getSDControllerApiEndpoint()}/tr069`, {
      method: 'get-config',
      payload: {}
    });

    if (response.data.code === 200) {
      apiResponse.value = response.data.data // Store API response
    }
  } catch (err) {
  }
};


</script>

<template>
  <NeHeading tag="h3" class="mb-4">{{ t('TR069') }}</NeHeading>

  <FormLayout
    :description="t('Configure TR069 service settings, including ACS credentials and connection intervals for remote device management.')">
    <NeToggle class="mb-3" v-model="service" :label="service ? 'Enabled' : 'Disabled'" :topLabel="'Service'" />

    <div class="space-y-6">

      <!-- Show form fields only if status is enabled -->
      <template v-if="service">
        <div class="flex flex-col space-y-6 w-[400px]">

          <NeTextInput @input="onlyValidUrlCharacters" v-model="acsUrl" :invalidMessage="errorBag.acsUrl"
            :label="t('ACS Url')" :placeholder="t('Enter ACS Url')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the URL of auto configuration server.') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput label="ACS Url" v-model.trim="acsUrl" @input="onlyValidUrlCharacters"
      :invalidMessage="errorBag.acsUrl" /> -->

          <NeTextInput @input="allowPasswordChars" v-model="acsUsername" :invalidMessage="errorBag.acsUsername"
            :label="t('ACS Username')" :placeholder="t('Enter ACS Username')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the username provided by your ACS server or ISP for authentication.') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput label="ACS Username" v-model.trim="acsUsername" @input="onlyLetters"
      :invalidMessage="errorBag.acsUsername" /> -->

          <NeTextInput type="password" @input="allowPasswordChars" v-model="acsPassword"
            :invalidMessage="errorBag.acsPassword" :label="t('ACS Password')" :placeholder="t('Enter ACS Password')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the password for ACS username.') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput label="ACS Password" v-model.trim="acsPassword" @input="onlyLetters"
      :invalidMessage="errorBag.acsPassword" /> -->

          <NeTextInput @input="allowPasswordChars" v-model="cpeUsername" :invalidMessage="errorBag.cpeUsername"
            :label="t('CPE Username')" :placeholder="t('Enter CPE Username')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('This is the username the ACS will used to authenticate.') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput label="CPE Username" v-model.trim="cpeUsername" @input="onlyLetters"
      :invalidMessage="errorBag.cpeUsername" /> -->

          <NeTextInput type="password" @input="allowPasswordChars" v-model="cpePassword"
            :invalidMessage="errorBag.cpePassword" :label="t('CPE Password')" :placeholder="t('Enter CPE Password')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('Enter the password for CPE username.') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput label="CPE Password" v-model.trim="cpePassword" @input="onlyLetters"
      :invalidMessage="errorBag.cpePassword" /> -->

          <NeToggle v-model="enableInterval" :label="enableInterval ? 'Enabled' : 'Disabled'"
            :topLabel="'Enable Interval'" />

          <NeTextInput :disabled="!enableInterval" @input="onlyNumbers" v-model="interval"
            :invalidMessage="errorBag.interval" :label="t('Interval')" :placeholder="t('Enter Interval')">
            <template #tooltip>
              <NeTooltip>
                <template #content>
                  {{ t('How often to the CPE will connect to ACS.') }}
                </template>
              </NeTooltip>
            </template>
          </NeTextInput>
          <!-- <NeTextInput label="Interval" :disabled="!enableInterval" v-model.trim="interval" @input="onlyNumbers"
      :invalidMessage="errorBag.interval" /> -->
        </div>
      </template>
    </div>

    <!-- Submit button (left aligned) -->
    <div class="flex mt-4 flex-col w-[90px]">
      <NeButton class=" ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
        @click.prevent="saveRule()">
        <template #prefix>
          <FontAwesomeIcon :icon="faSave" />
        </template>
        {{ t('common.save') }}
      </NeButton>
    </div>
  </FormLayout>

  <!-- <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
    {{ t('Configure TR069 service settings, including ACS credentials and connection intervals for remote device management.') }}
  </p> -->
  <!-- <form @submit.prevent="saveRule"> -->
 
</template>
