<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { NeHeading } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import FactoryResetContent from '@/components/standalone/factory_reset/FactoryResetContent.vue'

const { t } = useI18n()
</script>

<template>
  <div>
    <NeHeading tag="h3" class="mb-7">{{ t('standalone.factory_reset.title') }}</NeHeading>
    <FactoryResetContent />
  </div>
</template>
