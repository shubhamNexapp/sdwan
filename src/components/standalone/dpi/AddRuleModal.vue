<template>
  <NeModal :visible="props.visible" title="Add Rule" @close="emits('close')">
    <div class="p-4">
      <RuleForm v-model="form" />
    </div>
    <NeButton class="mr-2" kind="secondary" @click="emits('close')">Cancel</NeButton>
    <NeButton kind="primary" @click="saveRule">Save</NeButton>
  </NeModal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import {
  NeModal,
  NeButton,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import RuleForm from "./RuleForm.vue";

const props = defineProps<{ visible: boolean }>();
const emits = defineEmits(["close", "saved"]);

const form = ref({
  rule_name: "",
  enabled: true,
  action: "block",
  type: "",
  src_ip_string: "",
  app_name: [],
  describe: "",
});

const saveRule = async () => {
  try {
    const payload = {
      ...form.value,
      src_ip: form.value.src_ip_string
        .split(",")
        .map((ip: string) => ({ ip: ip.trim() })),
      enabled: form.value.enabled ? "1" : "0",
      app_name: form.value.app_name.map((name: string) => ({ name })),
    };

    const res = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method: "add-rule",
      payload,
    });

    emits("saved", payload);
    emits("close");
  } catch (err) {
    console.error("Add rule error:", getAxiosErrorMessage(err));
  }
};
</script>
