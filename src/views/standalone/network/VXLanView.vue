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
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { getSDControllerApiEndpoint } from '@/lib/config'
import { MessageBag } from "@/lib/validation";


const errorBag = ref(new MessageBag());

const t = (key: string) => key; // Mock translation function


const loading = ref({ saveRule: false })

const service = ref(false);
const status = ref("");
const baseInterface = ref("eth0");
const interfaceName = ref("");
const vid = ref("");
const peer = ref("");
const port = ref("");
const ipaddr = ref("");

let apiResponse = ref()

watch(
    () => apiResponse.value,
    (newValue) => {
        if (newValue) {
            service.value = newValue.service === 'enable';
            status.value = newValue.status || "";


        }
    },
    { deep: true, immediate: true }
);

onMounted(() => {
    getLists();
});

const getLists = async () => {
    try {
        const response = await axios.post(`${getSDControllerApiEndpoint()}/vxlan`, {
            method: 'get-config',
            payload: {}
        });
        if (response.data.code === 200) {
            apiResponse.value = response.data.data;
        }
    } catch (err) {
        console.error("Error fetching data:", err);
    }
};

const saveNetworkConfig = async () => {
    loading.value.saveRule = true;
    try {
        const payload = {
            method: "set-config",
            payload: {
                service: service.value ? "enable" : "disable",
            }
        };

        await axios.post(`${getSDControllerApiEndpoint()}/vxlan`, payload);
        getLists(); // Refresh list after saving
    } catch (err) {
        console.error("Error saving data:", err);
    } finally {
        loading.value.saveRule = false;
    }
};

</script>

<template>
    <NeHeading tag="h3" class="mb-7">VXLAN</NeHeading>
    <div class="flex flex-col gap-y-6">
        <div>
            <div class="flex flex-col items-start mb-4">
                <NeToggle v-model="service" label="Service" />
            </div>

            <label class="mr-4">Status:</label>
            <span>{{ status }}</span>
            <br />
            <br />

            <NeTextInput :label="t('Interface Name')" type="text" v-model="interfaceName"
                :invalidMessage="errorBag.getFirstFor('interfaceName')" :disabled="loading.saveRule" />
            <br />

            <label class="mr-4">Base Interface:</label>
            <select v-model="baseInterface" class="custom-select">
                <option value="eth0">eth0</option>
                <option value="eth1">eth1</option>
                <option value="eth2">eth2</option>
                <option value="eth3">eth3</option>
                <option value="eth4">eth4</option>
                <option value="eth5">eth5</option>
            </select>

            <NeTextInput :label="t('VID')" type="text" v-model="vid" :invalidMessage="errorBag.getFirstFor('vid')"
                :disabled="loading.saveRule" />
            <br />

            <NeTextInput :label="t('Peer')" type="text" v-model="peer" :invalidMessage="errorBag.getFirstFor('peer')"
                :disabled="loading.saveRule" />
            <br />

            <NeTextInput :label="t('Port')" type="text" v-model="port" :invalidMessage="errorBag.getFirstFor('port')"
                :disabled="loading.saveRule" />
            <br />

            <NeTextInput :label="t('IPaddr')" type="text" v-model="ipaddr"
                :invalidMessage="errorBag.getFirstFor('ipaddr')" :disabled="loading.saveRule" />
            <br />

            <!-- Save Button -->
            <div class="mt-4 flex justify-end">
                <NeButton kind="primary" size="lg" @click="saveNetworkConfig" :disabled="loading.saveRule">
                    Save
                </NeButton>
            </div>
        </div>
    </div>
</template>
