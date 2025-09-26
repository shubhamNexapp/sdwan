<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { NeCard, NeLink, NeSkeleton, NeBadge, getAxiosErrorMessage } from "@nethesis/vue-components";
import { useI18n } from "vue-i18n";
import { getStandaloneRoutePrefix } from "@/lib/router";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

// Random refresh interval 20-30 seconds
const REFRESH_INTERVAL = 20000 + Math.random() * 10000;

const { t } = useI18n();
const intervalId = ref<number | null>(null);

const loading = ref(true);
const status = ref<string>("loading"); // "connected" or "disconnect"
const errorTitle = ref<string>();
const errorDescription = ref<string>();

// Fetch Antivirus status
async function fetchAntivirusStatus() {
  loading.value = true;
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/clamav`, {
      method: "get-config",
      payload: {},
    });

    status.value = response.data?.data?.status || "disconnect";
    errorTitle.value = "";
    errorDescription.value = "";
  } catch (err: any) {
    console.error("Failed to fetch Antivirus config:", err);
    status.value = "disconnect";
    errorTitle.value = t("standalone.antivirus.failed_to_fetch_info");
    errorDescription.value = t(getAxiosErrorMessage(err));
  } finally {
    loading.value = false;
  }
}

// Computed badge
const hasStatus = computed(() => !!status.value && status.value !== "loading");
const badgeKind = computed(() => (status.value === "connected" ? "success" : "secondary"));
const badgeText = computed(() => (status.value === "connected" ? t("Active") : t("Inactive")));
const badgeIcon = computed(() => (status.value === "connected" ? faCheck : faXmark));

// Lifecycle
onMounted(() => {
  fetchAntivirusStatus();
  intervalId.value = window.setInterval(fetchAntivirusStatus, REFRESH_INTERVAL);
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
        class="text-primary-900"
        @click="$router.push(`${getStandaloneRoutePrefix($route)}/security/antivirus`)"
      >
        {{ t("Anti Virus") }}
      </NeLink>
    </template>

    <NeSkeleton v-if="loading" />

    <div v-else class="space-y-3">
      <NeBadge v-if="hasStatus" :kind="badgeKind" :text="badgeText" :icon="badgeIcon" />
    </div>
  </NeCard>
</template>
