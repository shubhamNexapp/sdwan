<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  NeHeading,
  getAxiosErrorMessage,
  NeInlineNotification,
  NeEmptyState,
  NeButton,
  NeSkeleton
} from '@nethesis/vue-components'
import { getProductName } from '@/lib/config'
import { ubusCall } from '@/lib/standalone/ubus'
import FlashstartContent from '@/components/standalone/security/FlashstartContent.vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getStandaloneRoutePrefix } from '@/lib/router'
import { useThreatShieldStore } from '@/stores/standalone/threatShield'

const { t } = useI18n()
const tsStore = useThreatShieldStore()
const router = useRouter()
const activeSubscription = ref(false)
const loading = ref({
  getSubscriptionInfo: true
})
const error = ref({
  getSubscriptionInfo: '',
  getSubscriptionInfoDetails: ''
})

async function fetchSubscriptionInfo() {
  loading.value.getSubscriptionInfo = true

  try {
    const res = await ubusCall('ns.subscription', 'info')
    activeSubscription.value = (res.data?.systemd_id && res.data?.active) || false

    if (activeSubscription.value) {
      tsStore.listDnsSettings()
    }
  } catch (err: any) {
    error.value.getSubscriptionInfo = t(getAxiosErrorMessage(err))
    error.value.getSubscriptionInfoDetails = err.toString()
  } finally {
    loading.value.getSubscriptionInfo = false
  }
}

onMounted(() => {
  fetchSubscriptionInfo()
})
</script>

<template>
  <div class="flex flex-col gap-y-6">
    <NeHeading tag="h3" class="mb-2">{{ t('standalone.flashstart.title') }}</NeHeading>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
      {{ t('standalone.ping_latency_monitor.description') }}
    </p>
    <NeInlineNotification v-if="error.getSubscriptionInfo" :title="t('error.cannot_retrieve_subscription_info')"
      :description="error.getSubscriptionInfo" class="mb-6" kind="error" />
    <NeSkeleton v-if="loading.getSubscriptionInfo || tsStore.loadingListDnsSettings" :lines="7" size="lg" />
    <template v-else>
      <!-- no active subscription -->
      <NeEmptyState v-if="!activeSubscription" :title="t('standalone.flashstart.flashstart_disabled')" :description="t('standalone.flashstart.flashstart_disabled_description', {
        product: getProductName()
      })
        " :icon="['fas', 'shield']" class="pb-8">
        <NeButton kind="primary" @click="
          () => {
            router.push(`${getStandaloneRoutePrefix()}/system/subscription`)
          }
        "><template #prefix>
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-4 w-4" aria-hidden="true" /> </template>{{
              t('common.go_to_page', { page: t('standalone.subscription.title') }) }}</NeButton>
      </NeEmptyState>
      <!-- threat shield dns is enabled -->
      <NeEmptyState v-else-if="tsStore.dnsSettings?.enabled" :title="t('standalone.flashstart.flashstart_disabled')"
        :description="t('standalone.flashstart.flashstart_disabled_threat_shield_enabled')" :icon="['fas', 'shield']"
        class="pb-8">
        <NeButton kind="primary" @click="
          () => {
            router.push(`${getStandaloneRoutePrefix()}/security/insta-shield-dns?tab=settings`)
          }
        ">
          <template #prefix>
            <font-awesome-icon :icon="['fas', 'arrow-right']" class="h-4 w-4" aria-hidden="true" />
          </template>
          {{ t('common.go_to_page', { page: t('standalone.threat_shield_dns.title') }) }}
        </NeButton>
      </NeEmptyState>
      <!-- flash start UI -->
      <FlashstartContent v-else />
    </template>
  </div>
</template>
