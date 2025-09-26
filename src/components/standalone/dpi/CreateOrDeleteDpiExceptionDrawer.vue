<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { DpiException } from "./DpiExceptions.vue";
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
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

const props = defineProps<{
  isShown: boolean;
  itemToEdit: DpiException | null;
}>();

const emit = defineEmits(["close", "add-edit-exception"]);
const { t } = useI18n();

const isSavingChanges = ref(false);
const error = ref({
  notificationTitle: "",
  notificationDescription: "",
  notificationDetails: "",
});
const validationErrorBag = ref(new MessageBag());

// Form fields
const id = ref("");
const exemptionName = ref("");
const criteria = ref("");
const enabled = ref(true);

// Reset form values when drawer is opened
function resetForm() {
  id.value = props.itemToEdit?.["config-name"] ?? "";
  exemptionName.value = props.itemToEdit?.exemption_name ?? "";
  criteria.value = props.itemToEdit?.criteria ?? "";
  enabled.value = props.itemToEdit?.enabled ?? true;
}

// Save function (Add or Edit)
const saveRule = async () => {
  try {
    console.log("exemptionName.value======", exemptionName.value);
    isSavingChanges.value = true;
    error.value = {
      notificationTitle: "",
      notificationDescription: "",
      notificationDetails: "",
    };

    // Build payload
    const payload = {
      exemption_name: exemptionName.value,
      enabled: enabled.value ? "1" : "0",
      criteria: criteria.value,
    };

    let method = "";
    if (exemptionName.value === "") {
      method = "add-exemption";
    } else {
      method = "edit-exemption";
    }

    await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
      method,
      payload,
    });

    emit("add-edit-exception"); // refresh parent list
    close();
  } catch (err: any) {
    console.error("Error saving rule:", err);
    error.value.notificationTitle = t("error.cannot_save_dpi_exception");
    error.value.notificationDescription = getAxiosErrorMessage(err);
    error.value.notificationDetails = err.toString();
  } finally {
    isSavingChanges.value = false;
  }
};

// Close drawer and reset form
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
      id
        ? t('standalone.dpi.edit_exception')
        : t('standalone.dpi.add_exception')
    "
  >
    <!-- Error -->
    <NeInlineNotification
      v-if="error.notificationTitle"
      kind="error"
      :title="error.notificationTitle"
      :description="error.notificationDescription"
      class="mb-6"
    >
      <template v-if="error.notificationDetails">{{
        error.notificationDetails
      }}</template>
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

      <!-- Criteria -->
      <NeTextInput
        v-model="criteria"
        :label="t('standalone.dpi.ip_address')"
        :invalid-message="t(validationErrorBag.getFirstI18nKeyFor('criteria'))"
      />

      <!-- Name -->
      <NeTextInput
        v-model="exemptionName"
        :label="t('standalone.dpi.exception_name')"
        :invalid-message="
          t(validationErrorBag.getFirstI18nKeyFor('exemption_name'))
        "
      />

      <!-- Actions -->
      <hr />
      <div class="flex justify-end">
        <NeButton kind="tertiary" class="mr-4" @click="close">
          {{ t("common.cancel") }}
        </NeButton>
        <NeButton
          kind="primary"
          @click="saveRule"
          :disabled="isSavingChanges"
          :loading="isSavingChanges"
        >
                    <FontAwesomeIcon :icon="['fas', 'floppy-disk']" aria-hidden="true" class="mr-2" />

          {{ id ? t("common.save") : t("standalone.dpi.add_exception") }}
        </NeButton>
      </div>
    </div>
  </NeSideDrawer>
</template>
