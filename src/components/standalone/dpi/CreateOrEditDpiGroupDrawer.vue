<!-- CreateOrEditDpiGroupDrawer.vue -->
<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import {
  NeInlineNotification,
  NeSideDrawer,
  NeButton,
  NeFormItemLabel,
  NeTextInput,
  NeToggle,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { MessageBag } from "@/lib/validation";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";

export type DpiGroup = {
  group_name: string;
  ip: { network: string }[];
  enabled: boolean;
};

const props = defineProps<{
  isShown: boolean;
  itemToEdit: DpiGroup | null;
}>();

const emit = defineEmits(["close", "save"]);
const { t } = useI18n();

// State
const isSavingChanges = ref(false);
const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});
const validationErrorBag = ref(new MessageBag());

// Form fields
const groupName = ref("");
const ipList = ref<{ network: string }[]>([]);
const enabled = ref(true);

// Reset form values when drawer opens
function resetForm() {
  groupName.value = props.itemToEdit?.group_name ?? "";
  ipList.value = props.itemToEdit?.ip
    ? JSON.parse(JSON.stringify(props.itemToEdit.ip))
    : [];
  enabled.value = props.itemToEdit?.enabled ?? true;
}

// Add new empty IP row
function addIpField() {
  ipList.value.push({ network: "" });
}

// Remove IP row
function removeIpField(index: number) {
  ipList.value.splice(index, 1);
}

// Save group
async function saveGroup() {
  try {
    isSavingChanges.value = true;
    error.value = {
      notificationTitle: "",
      notificationDescription: "",
      notificationDetails: "",
    };

    const payload = {
      group_name: groupName.value,
      ip: ipList.value,
      enabled: enabled.value ? "1" : "0",
    };

    const method = props.itemToEdit ? "edit-group" : "add-group";

    await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method,
      payload,
    });

    emit("save"); // refresh parent
    close();
  } catch (err: any) {
    console.error("Error saving group:", err);
    error.value.notificationTitle = t("error.cannot_save_dpi_group");
    error.value.notificationDescription = getAxiosErrorMessage(err);
    error.value.notificationDetails = err.toString();
  } finally {
    isSavingChanges.value = false;
  }
}

// Close drawer
function close() {
  resetForm();
  error.value = {
    notificationTitle: "",
    notificationDescription: "",
    notificationDetails: "",
  };
  validationErrorBag.value.clear();
  emit("close");
}

// Watch drawer visibility
watch(
  () => props.isShown,
  (val) => {
    if (val) resetForm();
  }
);
</script>

<template>
  <NeSideDrawer
    :is-shown="isShown"
    @close="close"
    :title="
      props.itemToEdit
        ? t('Edit Group')
        : t('Add Group')
    "
  >
    <!-- Error Notification -->
    <NeInlineNotification
      v-if="error.notificationTitle"
      kind="error"
      :title="error.notificationTitle"
      :description="error.notificationDescription"
      class="mb-6"
    >
      <template v-if="error.notificationDetails">
        {{ error.notificationDetails }}
      </template>
    </NeInlineNotification>

    <!-- Form -->
    <div class="flex flex-col gap-y-6">
      <!-- Status -->
      <div>
        <NeFormItemLabel>{{ t("standalone.dpi.status") }}</NeFormItemLabel>
        <NeToggle
          v-model="enabled"
          :label="enabled ? t('common.enabled') : t('common.disabled')"
        />
      </div>

      <!-- Group Name -->
      <NeTextInput
        v-model="groupName"
        :label="t('Group Name')"
        :invalid-message="
          t(validationErrorBag.getFirstI18nKeyFor('group_name'))
        "
      />

      <!-- IP Addresses -->
      <div>
        <NeFormItemLabel>{{ t("IP Addresses") }}</NeFormItemLabel>
        <div class="flex flex-col gap-2">
          <div
            v-for="(ip, index) in ipList"
            :key="index"
            class="flex items-center gap-2"
          >
            <NeTextInput v-model="ip.network" class="flex-1" />
            <NeButton
              kind="tertiary"
              size="sm"
              @click="removeIpField(index)"
              icon="trash"
            />
          </div>
          <NeButton kind="secondary" size="sm" @click="addIpField">
            {{ t("Add IP") }}
          </NeButton>
        </div>
      </div>

      <!-- Actions -->
      <hr />
      <div class="flex justify-end">
        <NeButton kind="tertiary" class="mr-4" @click="close">
          {{ t("common.cancel") }}
        </NeButton>
        <NeButton
          kind="primary"
          @click="saveGroup"
          :disabled="isSavingChanges"
          :loading="isSavingChanges"
        >
          {{
            props.itemToEdit ? t("common.save") : t("Save")
          }}
        </NeButton>
      </div>
    </div>
  </NeSideDrawer>
</template>
