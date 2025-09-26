<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { NeCard, NeLink, NeSkeleton, NeBadge, getAxiosErrorMessage } from "@nethesis/vue-components";
import { useI18n } from "vue-i18n";
import { getStandaloneRoutePrefix } from "@/lib/router";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

// Randomized refresh interval: 20-30 seconds
const REFRESH_INTERVAL = 20000 + Math.random() * 10000;

const { t } = useI18n();
const intervalId = ref<number | null>(null);

// State variables
const status = ref<string>("disconnect"); // "connected" | "disconnect" | "loading"
const loading = ref<boolean>(true);
const errorTitle = ref<string>();
const errorDescription = ref<string>();

// Computed properties for badge
const badgeKind = computed(() => (status.value === "connected" ? "success" : "secondary"));
const badgeText = computed(() => (status.value === "connected" ? t("Active") : t("Inactive")));
const badgeIcon = computed(() => (status.value === "connected" ? faCheck : faXmark));
const hasStatus = computed(() => !!status.value && status.value !== "loading");

// Fetch SNMP configuration
async function fetchSNMPStatus() {
  loading.value = true;
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/snmp`, {
      method: "get-config",
      payload: {},
    });

    const snmpData = response.data?.data;
    if (snmpData && snmpData.service) {
      status.value = snmpData.service === "enable" ? "connected" : "disconnect";
    } else {
      status.value = "disconnect";
    }

    loading.value = false;
    errorTitle.value = "";
    errorDescription.value = "";
  } catch (err: any) {
    console.error("Failed to fetch SNMP config:", err);
    status.value = "disconnect";
    loading.value = false;
    errorTitle.value = t("standalone.snmp.failed_to_fetch_info");
    errorDescription.value = t(getAxiosErrorMessage(err));
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchSNMPStatus();
  intervalId.value = window.setInterval(fetchSNMPStatus, REFRESH_INTERVAL);
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
        @click="$router.push(`${getStandaloneRoutePrefix($route)}/system/snmp`)"
        class="text-primary-900"
      >
        {{ t("SNMP") }}
      </NeLink>
    </template>

    <NeSkeleton v-if="loading" />

    <div v-else class="space-y-3">
      <NeBadge v-if="hasStatus" :icon="badgeIcon" :text="badgeText" :kind="badgeKind" />
    </div>
  </NeCard>
</template>
