<script setup lang="ts">
import {
  NeHeading,
  NeButton,
  NeTextInput,
  NeToggle,
  getAxiosErrorMessage
} from '@nethesis/vue-components'
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
  <NeHeading tag="h3" class="mb-7">TR069</NeHeading>
  <!-- <form @submit.prevent="saveRule"> -->
  <form>
    <div class="space-y-6">
      <NeToggle v-model="service" :label="service ? 'Enabled' : 'Disabled'" :topLabel="'Service'" />

      <!-- Show form fields only if status is enabled -->
      <template v-if="service">
        <div class="flex flex-col space-y-6 w-[400px]">

          <NeTextInput label="ACS Url" v-model.trim="acsUrl" @input="onlyValidUrlCharacters"
            :invalidMessage="errorBag.acsUrl" />

          <NeTextInput label="ACS Username" v-model.trim="acsUsername" @input="onlyLetters"
            :invalidMessage="errorBag.acsUsername" />

          <NeTextInput label="ACS Password" v-model.trim="acsPassword" @input="onlyLetters"
            :invalidMessage="errorBag.acsPassword" />

          <NeTextInput label="CPE Username" v-model.trim="cpeUsername" @input="onlyLetters"
            :invalidMessage="errorBag.cpeUsername" />

          <NeTextInput label="CPE Password" v-model.trim="cpePassword" @input="onlyLetters"
            :invalidMessage="errorBag.cpePassword" />

          <NeToggle v-model="enableInterval" :label="enableInterval ? 'Enabled' : 'Disabled'"
            :topLabel="'Enable Interval'" />

          <NeTextInput label="Interval" :disabled="!enableInterval" v-model.trim="interval" @input="onlyNumbers"
            :invalidMessage="errorBag.interval" />
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

    <!-- Footer -->
    <!-- <div class="flex justify-end mt-6">
      <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
        Cancel
      </NeButton>
      <NeButton kind="primary" type="submit">
        Save
      </NeButton>
    </div> -->
  </form>
</template>
