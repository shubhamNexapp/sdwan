<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { NeHeading } from '@nethesis/vue-components'
import NetifyInformaticsContent from '@/components/standalone/monitoring/NetifyInformaticsContent.vue'

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-y-6">
    <NeHeading tag="h3" class="mb-7">{{ t('standalone.netify_informatics.title') }}</NeHeading>
    <div>
      <NetifyInformaticsContent />
    </div>
  </div>
</template>
