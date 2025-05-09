<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage,
    NeTooltip,
    NeCombobox
} from '@nethesis/vue-components'
import { ref } from 'vue'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'

const { t } = useI18n();

const notificationsStore = useNotificationsStore()

const props = defineProps({
    isShown: { type: Boolean, default: false }
})

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false,
    fetchRule: false,
});

const emit = defineEmits(['close', 'save'])

// Form fields
const service = ref(false)
const name = ref("")
const destination = ref("")
const timeInterval = ref("")
const retryTimes = ref("")
const command = ref("")
const timeOutAction = ref("")
const custom_command = ref("")

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

const ipInputHandler = (event: Event) => {
    const input = event.target as HTMLInputElement;
    // Allow numbers and dots, and remove other characters
    input.value = input.value.replace(/[^0-9.]/g, '');
    // Limit to max 128 characters
    if (input.value.length > 128) {
        input.value = input.value.slice(0, 128);
    }
};


// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled
        if (!name.value.trim() || name.value.length > 64) {
            errorBag.value.name = "Task name is required and must be max 64 characters."
        }

        if (!destination.value.trim() || destination.value.length > 128) {
            errorBag.value.destination = "Destination is required and must be max 128 characters."
        }

        const timeInt = Number(timeInterval.value)
        if (!timeInterval.value.trim() || isNaN(timeInt) || timeInt < 1 || timeInt > 65535) {
            errorBag.value.timeInterval = "Time Interval must be between 1 and 65535."
        }

        const retryInt = Number(retryTimes.value)
        if (!retryTimes.value.trim() || isNaN(retryInt) || retryInt < 1 || retryInt > 65535) {
            errorBag.value.retryTimes = "Retry Times must be between 1 and 65535."
        }

        // if (command.value.trim().toLowerCase() !== "reboot") {
        //     errorBag.value.command = "Command must be 'reboot'."
        // }

        if (!timeOutAction.value) {
            errorBag.value.timeOutAction = "Time out action is required'."
        }
    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
        const payload = [{
            service: service.value ? "enabled" : "disabled",
            name: name.value,
            destination: destination.value,
            time_interval: timeInterval.value,
            retry_times: retryTimes.value,
            // command: command.value,
            time_out_action: timeOutAction.value,
            ...(timeOutAction.value === 'custom' && {
                custom_command: custom_command.value
            })
        }]

        const response = await axios.post(`${getSDControllerApiEndpoint()}/icmpcheck`, {
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
            emit('close') // Close drawer on success
        }
    } catch (err) {
        console.error("Error saving rule:", getAxiosErrorMessage(err))
    }
}

// Close drawer function
const closeDrawer = () => {
    emit('close')
}

</script>

<template>
    <NeSideDrawer :isShown="isShown" title="Add ICMP Check" closeAriaLabel="Close" @close="closeDrawer">
        <form>
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- Show form fields only if service is enabled -->
                <template v-if="service">
                    <NeTextInput @input="onlyLetters" v-model="name" :invalidMessage="errorBag.name"
                        :label="t('Task Name')" :placeholder="t('Enter Task Name')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Task Name" v-model.trim="name" @input="onlyLetters"
                        :invalidMessage="errorBag.name" /> -->

                    <NeTextInput @input="ipInputHandler" v-model="destination" :invalidMessage="errorBag.destination"
                        :label="t('Destination')" :placeholder="t('Enter Destination')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Destination" v-model.trim="destination" @input="ipInputHandler"
                        :invalidMessage="errorBag.destination" /> -->

                    <NeTextInput @input="onlyNumbers" v-model="timeInterval" :invalidMessage="errorBag.timeInterval"
                        :label="t('Time Interval')" :placeholder="t('Enter Time Interval')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Time Interval" v-model.trim="timeInterval" @input="onlyNumbers"
                        :invalidMessage="errorBag.timeInterval" /> -->

                    <NeTextInput @input="onlyNumbers" v-model="retryTimes" :invalidMessage="errorBag.retryTimes"
                        :label="t('Retry Times')" :placeholder="t('Enter Retry Times')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput label="Retry Times" v-model.trim="retryTimes" @input="onlyNumbers"
                        :invalidMessage="errorBag.retryTimes" /> -->

                    <!-- <NeTextInput @input="onlyLetters" v-model="command" :invalidMessage="errorBag.command"
                        :label="t('Command')" :placeholder="t('Enter Command')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput> -->
                    <!-- <NeTextInput label="Command" v-model.trim="command" @input="onlyLetters"
                        :invalidMessage="errorBag.command" /> -->

                    <NeCombobox v-model="timeOutAction" :options="[
                        { label: 'reboot', id: 'reboot' },
                        { label: 'custom', id: 'custom' },
                    ]" :label="t('Time Out Action')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                        :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                        :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
                        :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />

                    <span v-if="errorBag.timeOutAction" style="color: rgb(190 18 60 / var(--tw-text-opacity));">
                        {{ errorBag.timeOutAction }}
                    </span>
                    <!-- Conditionally rendered input if timeOutAction is 'custom' -->
                    <NeTextInput v-if="timeOutAction === 'custom'" v-model="custom_command"
                        :invalidMessage="errorBag.custom_command" :label="t('Custom Command')"
                        :placeholder="t('Enter Custom Command')" maxlength="128" />
                </template>
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <!-- Submit button (left aligned) -->
                <div class="flex flex-col w-[90px]">
                    <NeButton class=" ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary"
                        size="lg" @click.prevent="saveRule()">
                        <template #prefix>
                            <FontAwesomeIcon :icon="faSave" />
                        </template>
                        {{ t('common.save') }}
                    </NeButton>

                </div>
            </div>
        </form>
    </NeSideDrawer>
</template>
