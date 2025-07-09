<script setup lang="ts">
import {
    NeSideDrawer,
    NeButton,
    NeTextInput,
    NeToggle,
    getAxiosErrorMessage,
    NeCombobox,
    type NeComboboxOption,
} from '@nethesis/vue-components'
import { ref, watch } from 'vue'

import { useNotificationsStore } from '../../../stores/notifications'
import { getSDControllerApiEndpoint } from '@/lib/config'
import axios from 'axios'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from 'vue-i18n'
import NeMultiTextInput from '@/components/standalone/NeMultiTextInput.vue'
const { t } = useI18n()

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

const emit = defineEmits(['close', 'save', 'tunnel-added'])

// Form fields

const service = ref(false);
const name = ref("");
const listName = ref("");
const score = ref("");
const words = ref<NeComboboxOption[]>([''])


const id = ref("");
const bindInterfaceName = ref("");

let apiResponse = ref()
const interfaceOptions = ref([]);

watch(
    () => apiResponse.value,
    (newValue) => {
        if (newValue) {

            interfaceOptions.value = (newValue.up_interface || []).map((item: any) => ({
                label: item.ifname,
                id: item.ifname,
            }));

        }
    },
    { immediate: true }
);

// Validation error messages
const errorBag = ref<{ [key: string]: string }>({})


// Form validation function
const validate = () => {
    errorBag.value = {}

    if (service.value) { // Validate only if enabled
        if (!name.value.trim() || name.value.length > 32) {
            errorBag.value.name = "Name is required and must be max 32 characters."
        }

        const timeInt = Number(id.value)
        if (!id.value.trim() || isNaN(timeInt) || timeInt < 0 || timeInt > 65535) {
            errorBag.value.id = "Id must be between 0 and 65535."
        }

        if (!bindInterfaceName.value.trim()) {
            errorBag.value.bindInterfaceName = "Interface name is required."
        }

    }

    return Object.keys(errorBag.value).length === 0
}

// Save function
const saveRule = async () => {
    // if (!validate()) return

    try {
        // Collect entries into an array
        const payload =
        {
            service: service.value ? "enable" : "disable",
            "rule_name": name.value,
            "listname": listName.value,
            "score": score.value,
            words: words.value.map((w: any) => ({ word: w }))
        }

        const response = await axios.post(`${getSDControllerApiEndpoint()}/rspamd`, {
            method: "add-keyword",
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
            emit('tunnel-added')
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
    <NeSideDrawer :isShown="isShown" title="Add Keyword" closeAriaLabel="Close" @close="closeDrawer">
        <form @submit.prevent="saveRule">
            <div class="space-y-6">
                <NeToggle v-model="service" :label="service ? 'Enable' : 'Disable'" :topLabel="'Service'" />

                <!-- Show form fields only if status is enabled -->
                <template v-if="service">

                    <NeTextInput v-model.trim="name" :label="t('Name')" :placeholder="t('Enter Name')"
                        :invalidMessage="errorBag.name">
                    </NeTextInput>

                    <div>
                        <NeCombobox v-model="listName" :options="[
                            { label: 'forbidden', id: 'forbidden' },
                            { label: 'suspicious', id: 'suspicious' },
                            { label: 'sensitive', id: 'sensitive' },
                        ]" :label="t('List Name')" class="grow" :noResultsLabel="t('ne_combobox.no_results')"
                            :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
                            :noOptionsLabel="t('ne_combobox.no_options_label')"
                            :selected-label="t('ne_combobox.selected')"
                            :user-input-label="t('ne_combobox.user_input_label')"
                            :optionalLabel="t('common.optional')" />
                    </div>

                    <NeTextInput v-model.trim="score" :label="t('Score')" :placeholder="t('Enter score')"
                        :invalidMessage="errorBag.score">
                    </NeTextInput>
                    <div>
                        <NeMultiTextInput v-model="words" :add-item-label="t('Add words')" :title="t('Words')" />
                    </div>
                </template>
            </div>

            <!-- Footer -->
            <div class="flex justify-end mt-6">
                <NeButton kind="tertiary" @click.prevent="closeDrawer" class="mr-3">
                    Cancel
                </NeButton>
                <!-- Submit button (left aligned) -->
                <div class="flex  flex-col w-[130px]">
                    <NeButton class="ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary"
                        size="lg" @click.prevent="saveRule()">
                        <template>
                            <FontAwesomeIcon :icon="faSave" />
                        </template>
                        {{ t('Add Keyword') }}
                    </NeButton>
                </div>
            </div>
        </form>
    </NeSideDrawer>
</template>
