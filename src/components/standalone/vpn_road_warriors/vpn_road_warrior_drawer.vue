<script setup lang="ts">
import {
    NeInlineNotification,
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    NeDropdown,
    getAxiosErrorMessage
} from '@nethesis/vue-components'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import axios from 'axios'
import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'

const notificationsStore = useNotificationsStore()
const { t } = useI18n()

const props = defineProps({
    isShown: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'save'])

// Form fields
const status = ref(false)
const taskName = ref("")
const command = ref("")
const mode = ref("")
const week = ref("")
const month = ref("")
const day = ref("")
const hour = ref("")
const hourminute = ref("")
const interval = ref("")

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

// Form validation function
const validate = () => {
    errorBag.value = {}

    if (!taskName.value.trim()) {
        errorBag.value.taskName = "Task name is required."
    }

    if (!command.value.trim()) {
        errorBag.value.command = "Command name is required."
    }
    if (
        !mode.value) {
        errorBag.value.mode = "Mode is required."
    }
    if (showRangeFields.value) {
        if (!week.value.trim()) errorBag.value.week = "Week is required."
        if (!month.value.trim()) errorBag.value.month = "Month is required."
        if (!day.value.trim()) errorBag.value.day = "Day is required."
        if (!hour.value.trim()) errorBag.value.hour = "Hour is required."
        if (!hourminute.value.trim()) errorBag.value.hourminute = "Minute is required."
    }
    if (showIntervalField.value && !interval.value.trim()) {
        errorBag.value.interval = "Interval is required."
    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    if (!validate()) return

    try {
        const payload = {
            status: status.value ? "enabled" : "disabled",
            taskName: taskName.value,
            command: command.value,
            mode: mode.value,
            ...(showRangeFields.value && { week: week.value, month: month.value, day: day.value, hour: hour.value, hourminute: hourminute.value }),
            ...(showIntervalField.value && { interval: interval.value })
        }

        console.log("payload=======",payload)

        const response = await axios.post(`${getSDControllerApiEndpoint()}/schedule`, payload)

        if (response.status === 200) {
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
    <NeSideDrawer :isShown="isShown" title="Add Rule" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <!-- Status -->
                <NeToggle v-model="status" :label="status ? 'Enabled' : 'Disabled'" :topLabel="'Status'" />

                <!-- Task Name -->
                <NeTextInput label="Task Name" v-model.trim="taskName" :invalidMessage="errorBag.taskName" />

                <!-- Command -->
                <NeTextInput label="Command" v-model.trim="command" />

                <select v-model="mode"
                    style="width: 30%; height: 36px; padding: 6px; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; outline: none; margin-top: 20px; margin-bottom: 10px; transition: border-color 0.3s ease-in-out;">
                    <option value="" disabled selected>Select Mode</option>
                    <option value="range">Range</option>
                    <option value="interval">Interval</option>
                </select>

                <!-- Fields for "Range" mode -->
                <template v-if="showRangeFields">
                    <NeTextInput label="Week" v-model.trim="week" :invalidMessage="errorBag.week" />
                    <NeTextInput label="Month" v-model.trim="month" :invalidMessage="errorBag.month" />
                    <NeTextInput label="Day" v-model.trim="day" :invalidMessage="errorBag.day" />
                    <NeTextInput label="Hour" v-model.trim="hour" :invalidMessage="errorBag.hour" />
                    <NeTextInput label="Minute" v-model.trim="hourminute" :invalidMessage="errorBag.hourminute" />
                </template>

                <!-- Field for "Interval" mode -->
                <NeTextInput v-if="showIntervalField" label="Interval" v-model.trim="interval"
                    :invalidMessage="errorBag.interval" />
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <NeButton kind="primary" type="submit">
                    Save
                </NeButton>
            </div>
        </form>
    </NeSideDrawer>
</template>
