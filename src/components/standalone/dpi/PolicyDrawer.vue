<script setup lang="ts">
import { ref, watch } from "vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";
import RuleForm from "./RuleForm.vue";
import {
  NeSideDrawer,
  NeButton,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = defineProps<{
  isShown: boolean;
  itemToEdit: any | null;
}>();

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

// Reset or load data into form
watch(
  () => props.itemToEdit,
  (newVal) => {
    if (newVal) {
      form.value = {
        ...newVal,
        src_ip_string: newVal.src_ip?.join(", ") || "",
      };
    } else {
      form.value = {
        rule_name: "",
        enabled: true,
        action: "block",
        type: "",
        src_ip_string: "",
        app_name: [],
        describe: "",
      };
    }
  },
  { immediate: true }
);

const save = async () => {
  try {
    const payload = {
      ...form.value,
      src_ip: form.value.src_ip_string
        .split(",")
        .map((ip: string) => ({ ip: ip.trim() })),
      enabled: form.value.enabled ? "1" : "0",
      app_name: form.value.app_name.map((name: string) => ({ name })),
    };

    if (props.itemToEdit) {
      // edit
      await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
        method: "edit-rule",
        payload,
      });
      emits("saved", { ...form.value }, true);
    } else {
      // add
      await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
        method: "add-rule",
        payload,
      });
      emits("saved", { ...form.value }, true);
      emits("close")
    }
  } catch (err) {
    console.error("Save error:", getAxiosErrorMessage(err));
  }
};
</script>

<template>
  <NeSideDrawer
    :is-shown="props.isShown"
    @close="emits('close')"
    :title="props.itemToEdit ? t('Edit Rule') : t('Add Rule')"
  >
    <!-- Drawer Body -->
    <div class="flex h-full flex-col">
      <!-- Scrollable form -->
      <div class="flex-1 overflow-y-auto p-4">
        <RuleForm v-model="form" />
      </div>

      <!-- Sticky Footer -->
      <div class="flex justify-end gap-2 border-t border-gray-200 p-4">
        <NeButton kind="secondary" @click="emits('close')">
          {{ t("common.cancel") }}
        </NeButton>
        <NeButton kind="primary" @click="save">
          {{ t("common.save") }}
        </NeButton>
      </div>
    </div>
  </NeSideDrawer>
</template>
