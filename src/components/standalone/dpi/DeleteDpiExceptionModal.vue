<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import {
  NeInlineNotification,
  getAxiosErrorMessage,
} from "@nethesis/vue-components";
import { NeModal } from "@nethesis/vue-components";
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import { ubusCall } from "@/lib/standalone/ubus";
import type { DpiException } from "./DpiExceptions.vue";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";

const { t } = useI18n();

const props = defineProps<{
  visible: boolean;
  itemToDelete: DpiException | null;
}>();

const emit = defineEmits(["close", "dpi-exception-deleted"]);

const error = ref({
  notificationDescription: "",
  notificationDetails: "",
});
const isDeleting = ref(false);

const deleteModalVisible = async () => {
  if (!props.itemToDelete) return; // <-- ✅ prevents null usage

  const response = await axios.post(`${getSDControllerApiEndpoint()}/dpi`, {
    method: "delete-exemption",
    payload: { exemption_name: props.itemToDelete.exemption_name },
  });
  emit("dpi-exception-deleted");
  emit("close");
};

function close() {
  error.value = {
    notificationDescription: "",
    notificationDetails: "",
  };
  emit("close");
}
</script>

<template>
  <NeModal
    :visible="visible"
    kind="warning"
    :title="t('standalone.dpi.delete_exception')"
    :primaryLabel="t('common.delete')"
    :primaryButtonDisabled="isDeleting"
    :primaryButtonLoading="isDeleting"
    :close-aria-label="t('common.close')"
    @primaryClick="deleteModalVisible()"
    @close="close()"
  >
    {{
      t("standalone.dpi.delete_exception_message", {
        name: itemToDelete?.exemption_name ?? "",
      })
    }}
    <NeInlineNotification
      v-if="error.notificationDescription"
      kind="error"
      :title="t('error.cannot_delete_dpi_exception')"
      :description="error.notificationDescription"
      class="my-2"
      ><template v-if="error.notificationDetails">
        {{ error.notificationDetails }}
      </template></NeInlineNotification
    >
  </NeModal>
</template>
