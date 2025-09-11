<script lang="ts" setup>
import { useIpsStatusStore } from "@/stores/standalone/ipsStatus";
import {
  getAxiosErrorMessage,
  NeCard,
  NeLink,
  NeSkeleton,
  NeBadge,
} from "@nethesis/vue-components";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { getStandaloneRoutePrefix } from "@/lib/router";
import { useI18n } from "vue-i18n";
import IpsEnabledBadge from "@/components/standalone/security/ips/IpsEnabledBadge.vue";

// FontAwesome icons
import {
  faCheck,
  faTriangleExclamation,
  faXmark,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { getSDControllerApiEndpoint } from "@/lib/config";

const REFRESH_INTERVAL = 20000 + Math.random() * 10 * 1000;
const ips = useIpsStatusStore();
const intervalId = ref(0);
const { t } = useI18n();
const errorTitle = ref<string>();
const errorDescription = ref<string>();

const status = ref<string>("disconnect"); // default state

onMounted(() => {
  ips.fetchStatus();
  intervalId.value = setInterval(ips.fetchStatus, REFRESH_INTERVAL);

  // fetch HA configuration
  fetchConfiguration();
});

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

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
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/clamav`,
      {
        method: "get-config",
        payload: {},
      }
    );

    status.value = response.data.data.status || "disconnect";
  } catch (err) {
    console.error("Failed to fetch HA config:", err);
    status.value = "disconnect";
  }
}

// ✅ Badge mapping functions
function getBadgeKind(status: string) {
  switch (status) {
    case "connected":
      return "success";
    case "disconnect":
      return "error";
    default:
      return "error";
  }
}

function getBadgeText(status: string) {
  switch (status) {
    case "connected":
      return status;
    case "disconnect":
      return status;
    default:
      return status;
  }
}

function getBadgeIcon(status: string) {
  switch (status) {
    case "connected":
      return faCheck;
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
          $router.push(
            `${getStandaloneRoutePrefix($route)}/security/antivirus`
          )
        "
        class="text-primary-900"
      >
        {{ t("Anti Virus") }}
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
