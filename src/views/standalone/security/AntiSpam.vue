<script setup lang="ts">
import {
    NeHeading,
    NeButton,
    NeTable,
    NeTableHead,
    NeTableHeadCell,
    NeTableBody,
    NeTableRow,
    NeTableCell,
    NeToggle,
    NeTextInput
} from '@nethesis/vue-components'
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'

const loading = ref({ saveRule: false })
const service = ref(false)
const useBayes = ref(false)
const ipBlacklist = ref<string[]>([]);
const ipInput = ref("")
const errorMessage = ref<string>("");

const validateIp = (ip: string) => {
    // Regex for IPv4 validation
    const ipRegex = /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/;
    return ipRegex.test(ip);
};

const addIp = () => {
    const trimmedIp = ipInput.value.trim();
    if (!validateIp(trimmedIp)) {
        errorMessage.value = "Please enter a valid IP address.";
        return;
    }
    if (ipBlacklist.value.includes(trimmedIp)) {
        errorMessage.value = "This IP is already added.";
        return;
    }
    ipBlacklist.value.push(trimmedIp);
    ipInput.value = '';
    errorMessage.value = '';
};

const removeIp = (index: number) => {
    ipBlacklist.value.splice(index, 1);
};

const modeDetails = ref<
    {
        rule_name: string
        keyword: string,
        prompt_infomation: string,
        rule_service: boolean,
        test_type: string,
    }[]
>([])

const data = {
    "code": 200,
    "data": {
        "service": "enable",
        "use_bayes": "enable",
        "ip_blacklist": [
            "10.0.0.2",
            "16.56.32.89"
        ],
        "rule": [
            {
                "rule_service": "enable",
                "rule_name": "testname1",
                "test_type": "title",
                "keyword": "urgent|immediate action|response",
                "prompt_infomation": "Urgent theme guidance"
            },
            {
                "rule_service": "disable",
                "rule_name": "testname2",
                "test_type": "body",
                "keyword": "click (here|below)|(100% free|risk-free)",
                "prompt_infomation": "Typical fraud script"
            }
        ]
    }
}

onMounted(() => {
    getLists()
})

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/spam`, {
            method: 'get-config',
            payload: {}
        })

        if (response.data.code === 200 && response.data.data) {
            // const newValues = response.data.data
            const newValues = data.data

            service.value = newValues.service === 'enable'
            useBayes.value = newValues.use_bayes === 'enable'
            ipBlacklist.value = newValues.ip_blacklist || ''

            if (Array.isArray(newValues.rule)) {
                modeDetails.value = newValues.rule.map((item: any) => ({
                    rule_service: item.rule_service === 'enable',
                    rule_name: item.rule_name || '',
                    test_type: item.test_type || '',
                    keyword: item.keyword || 'urgent',
                    prompt_infomation: item.prompt_infomation || '',
                }))
            }
            else {
                modeDetails.value = []
            }
        }
    } catch (err) {
        console.error('Error fetching data:', err)
    }
}

const addModeDetails = () => {
    modeDetails.value.push({
        rule_service: false,
        rule_name: '',
        test_type: '',
        keyword: 'urgent',
        prompt_infomation: '',
    })
}

const deleteModeDetails = (index: number) => {
    modeDetails.value.splice(index, 1)
}

const saveNetworkConfig = async () => {
    loading.value.saveRule = true
    try {

        let payload = {
            method: 'set-config',
            payload: {
                service: service.value ? 'enable' : 'disable',
                use_bayes: useBayes.value ? 'enable' : 'disable',
                ip_blacklist: ipBlacklist.value,
                rule: modeDetails.value.map((item) => ({
                    rule_service: item.rule_service ? 'enable' : 'disable',
                    rule_name: item.rule_name,
                    test_type: item.test_type,
                    keyword: item.keyword,
                    prompt_infomation: item.prompt_infomation,
                }))
            }
        }
        console.log("payload=======", payload)

        await axios.post(`${getSDControllerApiEndpoint()}/spam`, payload)
        await getLists() // Refresh data after save
    } catch (err) {
        console.error('Error saving data:', err)
    } finally {
        loading.value.saveRule = false
    }
}


</script>

<template>
    <NeHeading tag="h3" class="mb-7">Anti Spam</NeHeading>

    <div class="flex flex-col gap-y-6">
        <div>
            <div class="flex flex-col items-start mb-4">
                <NeToggle class="mb-4" v-model="service" label="Service Status" />
                <NeToggle class="mb-4" v-model="useBayes" label="Use Bayes" />



                <div style="display: flex; align-items: center; gap: 8px;">
                    <NeTextInput v-model.trim="ipInput" placeholder="Enter IP Address" @keyup.enter="addIp" />
                    <NeButton kind="primary" size="lg" @click="addIp">
                        <template #prefix>
                            <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
                        </template>
                    </NeButton>
                </div>
                <div v-if="errorMessage" style="color: red; margin-top: 5px;">{{ errorMessage }}</div>

                <div style="margin-top: 10px;">
                    <div v-for="(ip, index) in ipBlacklist" :key="index"
                        style="display: flex; align-items: center; margin-bottom: 5px;">
                        <span style="flex-grow: 1;"><b>{{ ip }}</b></span>
                        <NeButton class="ml-4" size="sm" @click="removeIp(index)">
                            <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                        </NeButton>
                    </div>
                </div>


            </div>

            <div class="flex flex-row items-center justify-between mt-6">
                <p class="max-w-2xl font-bold text-black dark:text-gray-400">Mode Details</p>
                <NeButton kind="primary" size="lg" @click="addModeDetails">
                    <template #prefix>
                        <font-awesome-icon :icon="['fas', 'plus']" class="h-4 w-4" aria-hidden="true" />
                    </template>
                    Add
                </NeButton>
            </div>

            <NeTable cardBreakpoint="md" class="mt-2" ariaLabel="Interface Table">
                <NeTableHead>
                    <NeTableHeadCell>Rule Service</NeTableHeadCell>
                    <NeTableHeadCell>Rule Name</NeTableHeadCell>
                    <NeTableHeadCell>Test Type</NeTableHeadCell>
                    <NeTableHeadCell>Keyword</NeTableHeadCell>
                    <NeTableHeadCell>Prompt Information</NeTableHeadCell>
                    <NeTableHeadCell>Actions</NeTableHeadCell>
                </NeTableHead>
                <NeTableBody>
                    <NeTableRow v-for="(item, index) in modeDetails" :key="`new-${index}`">
                        <NeTableCell>
                            <NeToggle v-model="item.rule_service" label="Enable" />
                        </NeTableCell>
                        <NeTableCell>
                            <NeTextInput v-model.trim="item.rule_name" placeholder="Rule name" />
                        </NeTableCell>
                        <NeTableCell>
                            <NeTextInput v-model.trim="item.test_type" placeholder="Test Type" />
                        </NeTableCell>
                        <NeTableCell>
                            <select v-model="item.keyword" class="border rounded p-1">
                                <option value="urgent">urgent</option>
                                <option value="immediate action">immediate action</option>
                                <option value="response">response</option>
                            </select>
                        </NeTableCell>
                        <NeTableCell>
                            <NeTextInput v-model.trim="item.prompt_infomation" placeholder="Prompt Information" />
                        </NeTableCell>
                        <NeTableCell>
                            <NeButton size="sm" @click="deleteModeDetails(index)">
                                <font-awesome-icon :icon="['fas', 'trash']" class="h-4 w-4" aria-hidden="true" />
                            </NeButton>
                        </NeTableCell>
                    </NeTableRow>
                </NeTableBody>
            </NeTable>

            <div class="mt-4 flex justify-end">
                <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
                    Save
                </NeButton>
            </div>
        </div>
    </div>
</template>
