<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { NeCard, NeLink, NeSkeleton, NeBadge, getAxiosErrorMessage } from "@nethesis/vue-components";
import { useI18n } from "vue-i18n";
import { getStandaloneRoutePrefix } from "@/lib/router";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";

// FontAwesome icons
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

const REFRESH_INTERVAL = 20000 + Math.random() * 10000;

const { t } = useI18n();
const intervalId = ref<number | null>(null);

const errorTitle = ref<string>();
const errorDescription = ref<string>();
const loading = ref(true);

// status from API: "connected" or "disconnect"
const status = ref<string>("disconnect");

// Fetch HA status
async function fetchHAStatus() {
  loading.value = true;
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ns_ha`, {
      method: "get-config",
      payload: {},
    });

    status.value = response.data?.data?.status || "disconnect";
    loading.value = false;
  } catch (err: any) {
    console.error("Failed to fetch HA config:", err);
    status.value = "disconnect";
    loading.value = false;
    errorTitle.value = t("standalone.ips.failed_to_fetch_info");
    errorDescription.value = t(getAxiosErrorMessage(err));
  }
}

// Map API status to badge
const badgeKind = computed(() => (status.value === "connected" ? "success" : "secondary"));
const badgeText = computed(() => (status.value === "connected" ? t("Active") : t("Inactive")));
const badgeIcon = computed(() => (status.value === "connected" ? faCheck : faXmark));

const hasStatus = computed(() => !!status.value && status.value !== "loading");

// Lifecycle hooks
onMounted(() => {
  fetchHAStatus();
  intervalId.value = window.setInterval(fetchHAStatus, REFRESH_INTERVAL);
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
        @click="$router.push(`${getStandaloneRoutePrefix($route)}/network/ns-ha`)"
        class="text-primary-900"
      >
        {{ t("High Availability") }}
      </NeLink>
    </template>

    <NeSkeleton v-if="loading" />

    <div v-else class="space-y-3">
      <!-- ✅ Dynamic badge -->
      <NeBadge v-if="hasStatus" :icon="badgeIcon" :text="badgeText" :kind="badgeKind" />
    </div>
  </NeCard>
</template>
