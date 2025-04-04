<script setup lang="ts">
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

// Define a type for required fields
interface ValidationField {
  key: string;
  value: Ref<string>;
  type?: "string" | "number";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

// 🛠 Validation Function
// Define a type for required fields
interface ValidationField {
  key: string;
  value: Ref<string>;
  type?: "string" | "number";
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const isAlphabetic = (val: string) => /^[a-zA-Z]+$/.test(val);
const isNumeric = (val: string) => /^[0-9]+$/.test(val);

const validate = () => {
  errorBag.value.clear();

  // ✅ Allow submission without validation if service is disabled
  if (!service.value) {
    return true;
  }

  let isValid = true;

  // Define required fields based on SNMP version
  const requiredFields: ValidationField[] = [
    { key: "snmpVersion", value: snmpVersion, type: "string" },
  ];

  if (snmpVersion.value === "2c") {
    requiredFields.push(
      { key: "port", value: community, type: "number", maxLength: 32 },
      { key: "community", value: community, type: "string", maxLength: 32 },
      { key: "trapIp", value: trapIp, type: "string", maxLength: 16 },
      { key: "trapPort", value: trapPort, type: "number", min: 1, max: 65535 }
    );
  } else if (snmpVersion.value === "3") {
    requiredFields.push(
      { key: "snmp3port", value: snmp3port, type: "number", min: 1, max: 65535 },
      { key: "username", value: username, type: "string", maxLength: 32 },
      { key: "password", value: password, type: "string", maxLength: 32 },
      { key: "hash", value: hash, type: "string" }, // Assuming this is required but doesn't need length validation
      { key: "encryptionKey", value: encryptionKey, type: "string", minLength: 8, maxLength: 32 },
      { key: "encryption", value: encryption, type: "string" }
    );
  }

  requiredFields.forEach((field) => {
    const fieldValue = field.value.value.trim();

    // Required check
    if (!fieldValue) {
      errorBag.value.set(field.key, t("Required"));
      isValid = false;
      return;
    }

    // String length validation
    if (field.type === "string") {
      if (!isAlphabetic(fieldValue)) {
        errorBag.value.set(field.key, t("Only alphabetic characters allowed"));
        isValid = false;
      }
      if (field.maxLength && fieldValue.length > field.maxLength) {
        errorBag.value.set(field.key, t(`Max length is ${field.maxLength}`));
        isValid = false;
      }
      if (field.minLength && fieldValue.length < field.minLength) {
        errorBag.value.set(field.key, t(`Min length is ${field.minLength}`));
        isValid = false;
      }
    }


    if (field.type === "number") {
      if (!isNumeric(fieldValue)) {
        errorBag.value.set(field.key, t("Only numeric values allowed"));
        isValid = false;
      } else {
        const num = parseInt(fieldValue, 10);
        if ((field.min !== undefined && num < field.min) || (field.max !== undefined && num > field.max)) {
          errorBag.value.set(field.key, t(`Value must be between ${field.min} and ${field.max}`));
          isValid = false;
        }
      }
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


const submitForm = async () => {
  if (validate()) {
    let payload;

    if (!service.value) {
      // ✅ If service is disabled, send only service status
      payload = { service: "disable" };
    } else if (snmpVersion.value === "2c") {
      payload = {
        service: "enable",
        version: snmpVersion.value,
        snmpv2: {
          port: port.value,
          community: community.value,
          trap_ip: trapIp.value,
          trap_port: trapPort.value,
        },
      };
    } else {
      payload = {
        service: "enable",
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

    try {
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
    } catch (error) {
      console.error("Error saving SNMP configuration:", error);
    }
  } else {
    console.log("Validation failed.");
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

        <!-- Show form fields only if status is enabled -->
        <template v-if="service">
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

            <NeTextInput :label="t('Port')" type="text" v-model="snmp3port"
              :invalidMessage="errorBag.getFirstFor('snmp3port')" :disabled="loading.saveRule" />
            <br />

            <NeTextInput :label="t('User Name')" type="text" v-model="username"
              :invalidMessage="errorBag.getFirstFor('username')" :disabled="loading.saveRule" />
            <br />

            <NeTextInput :label="t('Password')" type="text" v-model="password"
              :invalidMessage="errorBag.getFirstFor('password')" :disabled="loading.saveRule" class="mb-5" />
            <br />

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
        </template>

        <NeButton kind="primary" size="lg" :disabled="loading.saveRule" :loading="loading.saveRule" @click="submitForm">
          Submit</NeButton>
      </div>
    </form>
  </div>
</template>
