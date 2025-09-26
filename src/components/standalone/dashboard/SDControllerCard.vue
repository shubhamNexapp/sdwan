<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { NeCard, NeLink, NeSkeleton, NeBadge, getAxiosErrorMessage } from "@nethesis/vue-components";
import { useI18n } from "vue-i18n";
import { getStandaloneRoutePrefix } from "@/lib/router";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";

// FontAwesome icons
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

// Refresh interval
const REFRESH_INTERVAL = 20000 + Math.random() * 10000;

const { t } = useI18n();
const intervalId = ref<number | null>(null);

// State
const loading = ref(true);
const errorTitle = ref<string>();
const errorDescription = ref<string>();
const status = ref<string>("disconnect"); // default: disconnected

// Fetch SD Controller status
async function fetchStatus() {
  loading.value = true;
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/sd_controller`, {
      method: "get-config",
      payload: {},
    });

    status.value = response.data?.data?.status || "disconnect";
    loading.value = false;
  } catch (err: any) {
    console.error("Failed to fetch SD Controller status:", err);
    status.value = "disconnect";
    loading.value = false;
    errorTitle.value = t("standalone.ips.failed_to_fetch_info");
    errorDescription.value = t(getAxiosErrorMessage(err));
  }
}

// Badge helpers
const badgeKind = computed(() => (status.value === "connected" ? "success" : "error"));
const badgeText = computed(() => (status.value === "connected" ? t("Active") : t("Inactive")));
const badgeIcon = computed(() => (status.value === "connected" ? faCheck : faXmark));
const hasStatus = computed(() => !!status.value && status.value !== "loading");

// Lifecycle hooks
onMounted(() => {
  fetchStatus();
  intervalId.value = window.setInterval(fetchStatus, REFRESH_INTERVAL);
});

onUnmounted(() => {
  if (intervalId.value) clearInterval(intervalId.value);
});
</script>

<template>
  <NeCard
    :error-title="errorTitle"
    :error-description="errorDescription"
    :loading="loading"
    :skeleton-lines="2"
    :icon="['fas', 'server']"
  >
    <template #title>
      <NeLink
        @click="$router.push(`${getStandaloneRoutePrefix($route)}/system/sd-controller`)"
        class="text-primary-900"
      >
        {{ t("SD Controller") }}
      </NeLink>
    </template>

    <NeSkeleton v-if="loading" />

    <div class="space-y-3" v-else>
      <!-- Dynamic Badge -->
      <NeBadge
        v-if="hasStatus"
        :kind="badgeKind"
        :text="badgeText"
        :icon="badgeIcon"
      />
    </div>
  </NeCard>
</template>
