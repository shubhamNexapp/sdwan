<script setup lang="ts">
import {
    NeInlineNotification,
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    NeDropdown,
    getAxiosErrorMessage,
    NeTooltip,
    NeCombobox
} from '@nethesis/vue-components'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'

const notificationsStore = useNotificationsStore()
const { t } = useI18n()

const props = defineProps({
    isShown: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save','tunnel-added'])

// Form fields
const service = ref(false)
const taskName = ref("")
const command = ref("")
const mode = ref("")
const week = ref("")
const month = ref("")
const day = ref("")
const hour = ref("")
const hourminute = ref("")
const interval = ref("")

let loading = ref({
    listServiceSuggestions: false,
    listObjectSuggestions: false,
    listProtocols: false,
    saveRule: false,
    fetchRule: false,
});

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({})

// Mode options for dropdown
const modeOptions = [
    { value: "range", label: "Range" },
    { value: "interval", label: "Interval" }
]

// Computed property to check selected mode and show respective fields
const showRangeFields = computed(() => mode.value === "range")
const showIntervalField = computed(() => mode.value === "interval")

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^0-9]/g, '') // Allow only numbers
}

// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled

        if (!taskName.value.trim() || taskName.value.length > 64) {
            errorBag.value.taskName = "Task name is required and must be max 64 characters.";
        }

        if (!command.value) {
            errorBag.value.command = "Command is required";
        }

        if (!mode.value.trim()) {
            errorBag.value.mode = "Mode is required.";
        }

        if (showRangeFields.value) {
            // const weekNumber = Number(week.value.trim());
            const monthNumber = Number(month.value.trim());
            const dayNumber = Number(day.value.trim());
            const hourNumber = Number(hour.value.trim());
            const minuteNumber = Number(hourminute.value.trim());

            // if (!week.value.trim()) {
            //     errorBag.value.week = "Week is required.";
            // } else if (isNaN(weekNumber) || weekNumber < 0 || weekNumber > 6) {
            //     errorBag.value.week = "Week must be a number between 0 and 6.";
            // }

            if (!month.value.trim()) {
                errorBag.value.month = "Month is required.";
            }
            //  else if (isNaN(monthNumber) || monthNumber < 1 || monthNumber > 12) {
            //     errorBag.value.month = "Month must be a number between 1 and 12.";
            // }

            if (!day.value.trim()) {
                errorBag.value.day = "Day is required.";
            } else if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 31) {
                errorBag.value.day = "Day must be a number between 1 and 31.";
            }

            if (!hour.value.trim()) {
                errorBag.value.hour = "Hour is required.";
            } else if (isNaN(hourNumber) || hourNumber < 0 || hourNumber > 23) {
                errorBag.value.hour = "Hour must be a number between 0 and 23.";
            }

            if (!hourminute.value.trim()) {
                errorBag.value.hourminute = "Minute is required.";
            } else if (isNaN(minuteNumber) || minuteNumber < 0 || minuteNumber > 59) {
                errorBag.value.hourminute = "Minute must be a number between 0 and 59.";
            }
        }

        if (showIntervalField.value) {
            const intervalNumber = Number(interval.value.trim());

            if (!interval.value.trim()) {
                errorBag.value.interval = "Interval is required.";
            } else if (isNaN(intervalNumber) || intervalNumber < 1 || intervalNumber > 1440) {
                errorBag.value.interval = "The interval time between command execution must be between 1 and 1440.";
            }
        }

    }

    // ❗ Clean up errorBag: Remove keys with empty values
    for (const key in errorBag.value) {
        if (!errorBag.value[key]) {
            delete errorBag.value[key];
        }
    }

    return Object.keys(errorBag.value).length === 0;
}


// Save function
const saveRule = async () => {
    if (!validate()) return

    try {

        const rule = {
            name: taskName.value,
            service: service.value ? "enable" : "disable",
            command: command.value,
            time_mode: mode.value,
            ...(showRangeFields.value && {
                // week: week.value ?? "*",
                month: month.value ?? "*",
                day: day.value ?? "*",
                hour: hour.value ?? "*",
                minute: hourminute.value ?? "*"
            }),
            ...(showIntervalField.value && {
                time_interval: interval.value
            })
        };

        const payload = {
            method: "set-config",
            payload: [rule] // wrapped inside an array
        };

        const response = await axios.post(`${getSDControllerApiEndpoint()}/schedule`, payload)

        if (response.status === 200) {
            notificationsStore.createNotification({
                title: 'Success',
                description: 'Configuration saved successfully.',
                kind: 'success'
            })

            emit('save', payload)
            emit('close') // Close drawer on success
            emit('tunnel-added')  // <--- EMIT after successful added

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
    <NeSideDrawer :isShown="isShown" title="Add Rule" closeAriaLabel="Close" @close="closeDrawer">
        <form>
            <!-- Status -->
            <NeToggle class="mb-4" v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

            <template v-if="service">
                <div class="space-y-6">

                    <!-- Task Name -->
                    <NeTextInput class="mt-4" v-model.trim="taskName" :invalidMessage="errorBag.taskName"
                        :label="t('Task Name')" :placeholder="t('Enter Task Name')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput class="mt-4" label="Task Name" v-model.trim="taskName"
                        :invalidMessage="errorBag.taskName" /> -->

                    <!-- Command -->
                    <!-- <NeTextInput class="mt-4" v-model.trim="command" :invalidMessage="errorBag.command"
                        :label="t('Command')" :placeholder="t('Enter Command')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput> -->
                    <NeCombobox v-model="command" :options="[
                        { label: 'Shut Down', id: 'shutdown' },
                        { label: 'Reboot', id: 'reboot' }
                    ]" :label="t('Command')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                        :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                        :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
                        :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />
                    <p v-if="errorBag.command" class="text-sm mt-1" style="color: rgba(190, 18, 60, 0.9);">
                        {{ errorBag.command }}
                    </p>
                    <!-- <NeTextInput label="Command" v-model.trim="command" :invalidMessage="errorBag.command" /> -->

                    <NeCombobox v-model="mode" :options="[
                        { label: 'Range', id: 'range' },
                        { label: 'Interval', id: 'interval' }
                    ]" :label="t('Interface')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                        :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                        :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
                        :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />


                    <!-- <div>
                        <label class="block text-sm font-medium mb-1">Mode:</label>
                        <select v-model="mode"
                            class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-full">
                            <option value="" disabled selected>Select Mode</option>
                            <option value="range">Range</option>
                            <option value="interval">Interval</option>
                        </select>
                    </div> -->
                    <br>
                    <!-- Display error manually -->
                    <span v-if="errorBag.mode" style="color: rgb(190 18 60 / var(--tw-text-opacity));">
                        {{ errorBag.mode }}
                    </span>
                    <!-- Fields for "Range" mode -->
                    <template v-if="showRangeFields">
                        <!-- <NeTextInput v-model.trim="week" :invalidMessage="errorBag.week" :label="t('Week')"
                            :placeholder="t('Enter Week')">
                            <template #tooltip>
                                <NeTooltip>
                                    <template #content>
                                        {{ t('standalone.logs.search_tooltip') }}
                                    </template>
                                </NeTooltip>
                            </template>
                        </NeTextInput> -->
                        <!-- <NeTextInput label="Week" v-model.trim="week" :invalidMessage="errorBag.week" /> -->

                        <!-- <NeTextInput v-model.trim="month" :invalidMessage="errorBag.month" :label="t('Month')"
                            :placeholder="t('Enter Month')">
                            <template #tooltip>
                                <NeTooltip>
                                    <template #content>
                                        {{ t('standalone.logs.search_tooltip') }}
                                    </template>
                                </NeTooltip>
                            </template>
                        </NeTextInput> -->
                        <NeCombobox v-model="month" :options="[
                            { label: 'Jan', id: 'Jan' },
                            { label: 'Feb', id: 'Feb' },
                            { label: 'Mar', id: 'Mar' },
                            { label: 'Apr', id: 'Apr' },
                            { label: 'May', id: 'May' },
                            { label: 'Jun', id: 'Jun' },
                            { label: 'Jul', id: 'Jul' },
                            { label: 'Aug', id: 'Aug' },
                            { label: 'Sep', id: 'Sep' },
                            { label: 'Oct', id: 'Oct' },
                            { label: 'Noc', id: 'Noc' },
                            { label: 'Dec', id: 'Dec' },
                        ]" :label="t('Month')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                            :noOptionsLabel="t('ne_combobox.no_options_label')"
                            :selected-label="t('ne_combobox.selected')"
                            :user-input-label="t('ne_combobox.user_input_label')"
                            :optionalLabel="t('common.optional')" />

                        <!-- <NeTextInput label="Month" v-model.trim="month" :invalidMessage="errorBag.month" /> -->

                        <NeTextInput v-model.trim="day" :invalidMessage="errorBag.day" :label="t('Day')"
                            :placeholder="t('Enter Day')">
                            <template #tooltip>
                                <NeTooltip>
                                    <template #content>
                                        {{ t('standalone.logs.search_tooltip') }}
                                    </template>
                                </NeTooltip>
                            </template>
                        </NeTextInput>
                        <!-- <NeTextInput label="Day" v-model.trim="day" :invalidMessage="errorBag.day" /> -->
                        <NeTextInput v-model.trim="hour" :invalidMessage="errorBag.hour" :label="t('Hour')"
                            :placeholder="t('Enter Hour')">
                            <template #tooltip>
                                <NeTooltip>
                                    <template #content>
                                        {{ t('standalone.logs.search_tooltip') }}
                                    </template>
                                </NeTooltip>
                            </template>
                        </NeTextInput>
                        <!-- <NeTextInput label="Hour" v-model.trim="hour" :invalidMessage="errorBag.hour" /> -->
                        <NeTextInput v-model.trim="hourminute" :invalidMessage="errorBag.hourminute"
                            :label="t('Minute')" :placeholder="t('Enter Minute')">
                            <template #tooltip>
                                <NeTooltip>
                                    <template #content>
                                        {{ t('standalone.logs.search_tooltip') }}
                                    </template>
                                </NeTooltip>
                            </template>
                        </NeTextInput>
                        <!-- <NeTextInput label="Minute" v-model.trim="hourminute" :invalidMessage="errorBag.hourminute" /> -->
                    </template>

                    <!-- Field for "Interval" mode -->
                    <NeTextInput v-if="showIntervalField" class="mt-4" @input="onlyNumbers" v-model.trim="interval"
                        :invalidMessage="errorBag.interval" :label="t('Interval')" :placeholder="t('Enter Interval')">
                        <template #tooltip>
                            <NeTooltip>
                                <template #content>
                                    {{ t('standalone.logs.search_tooltip') }}
                                </template>
                            </NeTooltip>
                        </template>
                    </NeTextInput>
                    <!-- <NeTextInput v-if="showIntervalField" @input="onlyNumbers" label="Interval" v-model.trim="interval"
                        :invalidMessage="errorBag.interval" /> -->
                </div>
            </template>
            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <!-- Submit button (left aligned) -->
                <div class="flex  flex-col w-[90px]">
                    <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary"
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
