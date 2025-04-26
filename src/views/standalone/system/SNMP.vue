<script setup lang="ts">
import {
  NeHeading,
  NeTextInput,
  NeToggle,
  NeButton,
  NeTooltip
} from "@nethesis/vue-components";
import { onMounted, ref, watch, type Ref } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import { MessageBag } from "@/lib/validation";
import { useNotificationsStore } from "../../../stores/notifications";
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSave } from '@fortawesome/free-solid-svg-icons'
import { useI18n } from "vue-i18n";


const notificationsStore = useNotificationsStore();

export type IpsecTunnel = {
  id: string;
  name: string;
  local: string[];
  remote: string[];
  enabled: "0" | "1";
  connected: boolean;
};

// const t = (key: string) => key; // Mock translation function
const { t } = useI18n()

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

// Function to allow only letters in string fields
const onlyLetters = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^a-zA-Z\s]/g, '') // Allow only letters and spaces
}

const validateIp = (event: Event) => {
  const input = event.target as HTMLInputElement;
  input.value = input.value.replace(/[^0-9./]/g, ''); // allow only numbers, dots, slash
  trapIp.value = input.value; // Update your v-model
};

// Function to allow only numbers in number fields
const onlyNumbers = (event: Event) => {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^0-9]/g, '') // Allow only numbers
}


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
      { key: "port", value: port, type: "number", min: 1, max: 65535 },
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
    <div class="mb-4">
      <NeHeading tag="h3">SNMP</NeHeading>
    </div>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('standalone.ping_latency_monitor.description') }}
    </p>
    <form class="flex flex-col space-y-6">
      <!-- Status Toggle (fixed width and left aligned) -->
      <div class="flex flex-col w-[400px]">
        <NeToggle v-model="service" :topLabel="t('Status')" :label="service ? 'Enable' : 'Disable'" />
      </div>

      <!-- Fields only if enabled -->
      <template v-if="service">
        <div class="flex flex-col space-y-6 w-[400px]">
          <div>
            <label class="block text-sm font-medium mb-1">SNMP Version:</label>
            <select v-model="snmpVersion"
              class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-full">
              <option value="2c">2c</option>
              <option value="3">3</option>
            </select>
          </div>

          <!-- If version 2c -->
          <template v-if="snmpVersion === '2c'">
            <NeTextInput v-model="port" :invalid-message="errorBag.getFirstFor('port')"
              :label="t('Port')" :placeholder="t('Port Number')">
              <template #tooltip>
                <NeTooltip>
                  <template #content>
                    {{ t('standalone.logs.search_tooltip') }}
                  </template>
                </NeTooltip>
              </template>
            </NeTextInput>
            <NeTextInput :label="t('Port')" @input="onlyNumbers" type="number" v-model="port"
              :invalidMessage="errorBag.getFirstFor('port')" :disabled="loading.saveRule" />

            <NeTextInput :label="t('Community')" @input="onlyLetters" type="text" v-model="community"
              :invalidMessage="errorBag.getFirstFor('community')" :disabled="loading.saveRule" />

            <NeTextInput :label="t('Trap IP')" @input="validateIp" type="text" v-model="trapIp"
              :invalidMessage="errorBag.getFirstFor('trapIp')" :disabled="loading.saveRule" />

            <NeTextInput :label="t('Trap Port')" @input="onlyNumbers" type="text" v-model="trapPort"
              :invalidMessage="errorBag.getFirstFor('trapPort')" :disabled="loading.saveRule" />
          </template>

          <!-- If version 3 -->
          <template v-if="snmpVersion === '3'">
            <h4 class="text-lg font-semibold mb-2">SNMPv3 Account</h4>

            <NeTextInput :label="t('Port')" type="text" v-model="snmp3port"
              :invalidMessage="errorBag.getFirstFor('snmp3port')" :disabled="loading.saveRule" />

            <NeTextInput :label="t('User Name')" type="text" v-model="username"
              :invalidMessage="errorBag.getFirstFor('username')" :disabled="loading.saveRule" />

            <NeTextInput :label="t('Password')" type="text" v-model="password"
              :invalidMessage="errorBag.getFirstFor('password')" :disabled="loading.saveRule" />

            <div>
              <label class="block text-sm font-medium mb-1">Hash:</label>
              <select v-model="hash"
                class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-full">
                <option value="MD5">MD5</option>
                <option value="SHA">SHA</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium mb-1">Encryption:</label>
              <select v-model="encryption"
                class="border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-400 w-full">
                <option value="AES">AES</option>
                <option value="DES">DES</option>
              </select>
            </div>

            <NeTextInput :label="t('Encryption Key')" type="text" v-model="encryptionKey"
              :invalidMessage="errorBag.getFirstFor('encryptionKey')" :disabled="loading.saveRule" />
          </template>
        </div>
      </template>

      <!-- Submit button (left aligned) -->
      <div class="flex mt-4 flex-col w-[90px]">
        <NeButton class=" ml-1" :disabled="loading.saveRule" :loading="loading.saveRule" kind="primary" size="lg"
          @click.prevent="submitForm()">
          <template #prefix>
            <FontAwesomeIcon :icon="faSave" />
          </template>
          {{ t('Save') }}
        </NeButton>
        <!-- <NeButton kind="primary" size="lg" :disabled="loading.saveRule" :loading="loading.saveRule" @click="submitForm">
          Save
        </NeButton> -->
      </div>
    </form>
  </div>
</template>
