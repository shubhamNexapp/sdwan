<script setup lang="ts">
import { useI18n } from "vue-i18n";
import {
  NeHeading,
  NeTextInput,
  NeToggle,
  NeButton,
} from "@nethesis/vue-components";
import { onMounted, ref, watch, type Ref } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { MessageBag } from "@/lib/validation";
import { useNotificationsStore } from "../../../stores/notifications";

const notificationsStore = useNotificationsStore();

export type IpsecTunnel = {
  id: string;
  name: string;
  local: string[];
  remote: string[];
  enabled: "0" | "1";
  connected: boolean;
};

const t = (key: string) => key; // Mock translation function

// Form Fields
const service = ref(false);
const snmpService = ref(false); // Initially set to false
const snmpVersion = ref("2c"); // "2c" or "3"
const port = ref("");
const community = ref("");
const trapIp = ref("");
const trapPort = ref("");
const username = ref("");
const password = ref("");
const hash = ref("");
const encryption = ref("");
const encryptionKey = ref("");
const snmp3port = ref("");
// 🔍 Function to check if a field is empty
const validateRequired = (value: string) => {
  return value.trim() !== "";
};

let loading = ref({
  listServiceSuggestions: false,
  listObjectSuggestions: false,
  listProtocols: false,
  saveRule: false,
  fetchRule: false,
});

// ✅ Fetch SNMP Configuration
const fetchSNMPConfig = async () => {
  loading.value.fetchRule = true;
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/snmp`, {
      method: "get-config",
      payload: {},
    });

    if (response.data) {
      const data = response.data.payload;
      const dataValue = response.data.data;
      snmpService.value = dataValue.service || "";
      // service.value = newValue.service === 'enable';
      service.value = dataValue.service === 'enable';
      snmpVersion.value = dataValue.version || "";
      port.value = dataValue.snmpv2.port || "";
      community.value = dataValue.snmpv2.community || "";
      trapIp.value = dataValue.snmpv2.trap_ip || "";
      trapPort.value = dataValue.snmpv2.trap_port || "";
      username.value = dataValue.snmpv3.account[0].username || "";
      password.value = dataValue.snmpv3.account[0].password || "";
      hash.value = dataValue.snmpv3.account[0].hash || "";
      encryption.value = dataValue.snmpv3.account[0].encrypt || "";
      encryptionKey.value = dataValue.snmpv3.account[0].key || "";
      snmp3port.value = dataValue.snmpv3.port || "";
    }
  } catch (error) {
    console.error("Error fetching SNMP configuration:", error);
  } finally {
    loading.value.fetchRule = false;
  }
};

const errorBag = ref(new MessageBag());

// 🛠 Validation Function
const validate = () => {
  errorBag.value.clear();
  let isValid = true;

  const requiredFields = [
    // { key: "snmpService", value: snmpService },
    { key: "snmpVersion", value: snmpVersion },
    // { key: "port", value: port },
  ];

  if (snmpVersion.value === "2c") {
    requiredFields.push(
      { key: "community", value: community },
      { key: "trapIp", value: trapIp },
      { key: "trapPort", value: trapPort }
    );
  } else if (snmpVersion.value === "3") {
    requiredFields.push(
      { key: "snmp3port", value: snmp3port },
      { key: "username", value: username },
      { key: "password", value: password },
      { key: "hash", value: hash },
      { key: "encryptionKey", value: encryptionKey },
      { key: "encryption", value: encryption }
    );
  }

  requiredFields.forEach((field) => {
    if (!validateRequired(field.value.value)) {
      errorBag.value.set(field.key, t("Required"));
      isValid = false;
    }
  });

  return isValid;
};

// ✅ Watch each field separately to clear errors when the user types
const fieldsToWatch: Record<string, Ref<string>> = {
  // snmpService,
  snmpVersion,
  port,
  community,
  trapIp,
  trapPort,
  username,
  password,
  encryptionKey,
};

Object.keys(fieldsToWatch).forEach((fieldKey) => {
  watch(fieldsToWatch[fieldKey], (newValue) => {
    if (newValue.trim() !== "") {
      errorBag.value.delete(fieldKey);
    }
  });
});

// const submitForm = async () => {
// if (validate()) {
// let v2Data
// if (snmpVersion.value === "2") {
// v2Data = {
// snmpService: snmpService.value,
// snmpVersion: snmpVersion.value,
// port: port.value,
// community: community.value,
// trapIp: trapIp.value,
// trapPort: trapPort.value,
// username: username.value,
// }
// } else {
// v2Data = {
// snmpService: snmpService.value,
// snmpVersion: snmpVersion.value,
// port: port.value,

// }
// }
// const payload = v2Data

// const response = await axios.post(${getSDControllerApiEndpoint()}/snmp, {
// method: 'set-config',
// v2Data
// });

// if (response.data.code === 200) {
// notificationsStore.createNotification({
// title: 'Success',
// description: 'Configuration saved successfully.',
// kind: 'success'
// });
// await fetchSNMPConfig();
// }
// } else {
// console.log("Validation failed===");
// }
// };
// 🔥 Submit Form

const submitForm = async () => {
  if (validate()) {
    let v2Data;
    let isenable;
    if (snmpVersion.value === "2c") {
      v2Data = {
        service: service.value ? "enable" : "disable",
        version: snmpVersion.value,
        snmpv2: {
          port: port.value,
          community: community.value,
          trap_ip: trapIp.value,
          trap_port: trapPort.value,
        },
      };
    } else {
      v2Data = {
        service: service.value ? "enable" : "disable",
        version: snmpVersion.value,
        snmpv3: {
          port: snmp3port.value,
          account: [
            {
              username: username.value,
              password: password.value,
              hash: hash.value,
              encrypt: encryption.value,
              key: encryptionKey.value,
            },
          ],
        },
      };
    }
    const payload = v2Data;
    // {
    //   snmpService: snmpService.value,
    //   snmpVersion: snmpVersion.value,
    //   port: port.value,
    //   community: community.value,
    //   trapIp: trapIp.value,
    //   trapPort: trapPort.value,
    //   username: username.value,
    //   password: password.value,
    //   hash: hash.value,
    //   encryption: encryption.value,
    //   encryptionKey: encryptionKey.value,
    // };

    const response = await axios.post(`${getSDControllerApiEndpoint()}/snmp`, {
      method: "set-config",
      payload,
    });

    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: "Configuration saved successfully.",
        kind: "success",
      });
      await fetchSNMPConfig();
    }
  } else {
    console.log("Validation failed===");
  }
};

// ✅ Fetch data on component mount
onMounted(fetchSNMPConfig);
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">SNMP</NeHeading>
    </div>
    <form>
      <div class="space-x-6 space-y-6">
        <!-- enabled -->
        <NeToggle v-model="service" label="Enable Service" />

        <!-- <NeToggle class="ml-5" v-model="snmpService" :label="snmpService == true ? 'enable' : 'disable'"
          :topLabel="'status'" :disabled="loading.saveRule" /> -->
        <!-- <NeToggle
          v-model="snmpService"
          :label="snmpService ? 'enable' : 'disable'"
          :topLabel="'status'"
          :disabled="loading.saveRule"
        /> -->
        <!-- service -->
        <!-- <NeToggle v-model="service" :label="service ? t('common.enabled') : t('common.disabled')"
          :topLabel="t('Service')" :disabled="loading.saveRule" /> -->

        <!-- <div>
          <label>
            <input type="radio" v-model="snmpService" value="enable" />
            Enable
          </label>

          <label>
            <input type="radio" v-model="snmpService" value="disable" />
            Disable
          </label>
        </div> -->
        <div v-if="snmpVersion">
          <h4>Basic Settings</h4>
          <br />
          <div>
            <label class="mr-4">SNMP Version:</label>
            <select v-model="snmpVersion" style="
                width: 30%;
                height: 36px;
                padding: 6px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s ease-in-out;
              ">
              <option value="2c">2c</option>
              <option value="3">3</option>
            </select>
          </div>
          <br />

        </div>

        <div v-if="snmpVersion === '2c'">

          <NeTextInput :label="t('Port')" type="text" v-model="port" :invalidMessage="errorBag.getFirstFor('port')"
            :disabled="loading.saveRule" />

          <NeTextInput :label="t('Community')" type="text" v-model="community"
            :invalidMessage="errorBag.getFirstFor('community')" :disabled="loading.saveRule" />

          <NeTextInput :label="t('Trap IP')" type="text" v-model="trapIp"
            :invalidMessage="errorBag.getFirstFor('trapIp')" :disabled="loading.saveRule" />

          <NeTextInput :label="t('Trap Port')" type="text" v-model="trapPort"
            :invalidMessage="errorBag.getFirstFor('trapPort')" :disabled="loading.saveRule" />
        </div>

        <div v-if="snmpVersion === '3'">
          <h1>SNMPv3 Account</h1>
          <br />

          <NeTextInput :label="t('Port')" type="text" v-model="snmp3port" :invalidMessage="errorBag.getFirstFor('snmp3port')"
            :disabled="loading.saveRule" />

          <NeTextInput :label="t('User Name')" type="text" v-model="username"
            :invalidMessage="errorBag.getFirstFor('username')" :disabled="loading.saveRule" />

          <NeTextInput :label="t('Password')" type="text" v-model="password"
            :invalidMessage="errorBag.getFirstFor('password')" :disabled="loading.saveRule" class="mb-5" />

          <!-- <NeTextInput
            :label="t('Hash')"
            type="text"
            v-model="hash"
            :invalidMessage="errorBag.getFirstFor('hash')"
            :disabled="loading.saveRule"
          /> -->
          <label class="mt-4 mr-4">Hash :</label>
          <div>

            <select v-model="hash" style="
                width: 30%;
                height: 36px;
                padding: 6px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                margin-top: 20px;
                margin-bottom: 10px;
                outline: none;
                transition: border-color 0.3s ease-in-out;
              ">
              <option value="MD5">MD5</option>
              <option value="SHA">SHA</option>
            </select>
          </div>

          <!-- <NeTextInput
            :label="t('Encryption')"
            type="text"
            v-model="encryption"
            :invalidMessage="errorBag.getFirstFor('encryption')"
            :disabled="loading.saveRule"
          /> -->
          <label class="mr-4 ">Encryption :</label>
          <div>

            <select v-model="encryption" style="
                width: 30%;
                height: 36px;
                padding: 6px;
                border: 1px solid #ccc;
                border-radius: 5px;
                font-size: 14px;
                outline: none;
                margin-top: 20px;
                margin-bottom: 10px;
                transition: border-color 0.3s ease-in-out;
              ">
              <option value="AES">AES</option>
              <option value="DES">DES</option>
            </select>
          </div>

          <NeTextInput :label="t('Encryption Key')" type="text" v-model="encryptionKey"
            :invalidMessage="errorBag.getFirstFor('encryptionKey')" :disabled="loading.saveRule" />
        </div>

        <NeButton kind="primary" size="lg" :disabled="loading.saveRule" :loading="loading.saveRule" @click="submitForm">
          Submit</NeButton>
      </div>
    </form>
  </div>
</template>
