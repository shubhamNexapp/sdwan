<script lang="ts" setup>
import { useIpsStatusStore } from "@/stores/standalone/ipsStatus";
import {
  getAxiosErrorMessage,
  NeCard,
  NeLink,
  NeSkeleton,
  NeBadge,
} from "@nethesis/vue-components";
import { onMounted, onUnmounted, ref, watch, computed } from "vue";
import { getStandaloneRoutePrefix } from "@/lib/router";
import { useI18n } from "vue-i18n";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";

// FontAwesome icons
import {
  faCheck,
  faTriangleExclamation,
  faXmark,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";

const REFRESH_INTERVAL = 20000 + Math.random() * 10 * 1000;
const ips = useIpsStatusStore();
const intervalId = ref<number | null>(null);
const { t } = useI18n();

const errorTitle = ref<string>();
const errorDescription = ref<string>();
const status = ref<string>("disconnect"); // default state

// fetch IPS status regularly
onMounted(() => {
  ips.fetchStatus();
  intervalId.value = window.setInterval(ips.fetchStatus, REFRESH_INTERVAL);

  // fetch HA configuration
  fetchConfiguration();
});

onUnmounted(() => {
  if (intervalId.value) clearInterval(intervalId.value);
});

// Watch for store errors
watch(
  () => ips.error,
  (error) => {
    if (error) {
      errorTitle.value = t("standalone.ips.failed_to_fetch_info");
      errorDescription.value = t(getAxiosErrorMessage(error));
    } else {
      errorTitle.value = "";
      errorDescription.value = "";
    }
  }
);

// API call for HA status
async function fetchConfiguration() {
  try {
    const response = await axios.post(`${getSDControllerApiEndpoint()}/ns_ha`, {
      method: "get-config",
      payload: {},
    });

    status.value = response.data?.data?.status || "disconnect";
    console.log("HA status:", status.value);
  } catch (err) {
    console.error("Failed to fetch HA config:", err);
    status.value = "disconnect";
  }
}

// ✅ Badge mapping functions
function getBadgeKind(status: string) {
  switch (status) {
    case "Master":
      return "success";
    case "Backup":
      return "warning";
    case "Fault":
      return "warning";
    case "Unknown":
      return "warning";
    case "disconnect":
      return "error";
    default:
      return "error";
  }
}

function getBadgeText(status: string) {
  switch (status) {
    case "Master":
      return status;
    case "Backup":
      return status;
    case "Fault":
      return status;
    case "Unknown":
      return status;
    case "disconnect":
      return status;
    default:
      return status;
  }
}

function getBadgeIcon(status: string) {
  switch (status) {
    case "Master":
      return faCheck;
    case "Backup":
      return faCheck;
    case "Fault":
      return faCheck;
    case "Unknown":
      return faTriangleExclamation;
    case "disconnect":
      return faXmark;
    default:
      return faQuestion;
  }
}

const hasStatus = computed(() => !!status.value && status.value !== "loading");
</script>

<template>
  <NeCard
    :error-description="errorDescription"
    :error-title="errorTitle"
    :icon="['fas', 'server']"
    :loading="ips.loading"
    :skeleton-lines="2"
  >
    <template #title>
      <NeLink
        @click="
          $router.push(`${getStandaloneRoutePrefix($route)}/network/ns-ha`)
        "
        class="text-primary-900"
      >
        {{ t("High Availiability") }}
      </NeLink>
    </template>

    <NeSkeleton v-if="ips.loading" />

    <div class="space-y-3" v-else>
      <!-- ✅ Dynamic NeBadge -->
      <NeBadge
        v-if="hasStatus"
        :kind="getBadgeKind(status)"
        :text="getBadgeText(status)"
        :icon="getBadgeIcon(status)"
      />
    </div>
  </NeCard>
</template>
