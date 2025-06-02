<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import SshConfig from '@/components/standalone/ssh/SshConfig.vue'
import SshKeys from '@/components/standalone/ssh/SshKeys.vue'
import { NeHeading } from '@nethesis/vue-components'

const { t } = useI18n()
</script>

<template>
  <NeHeading tag="h3" class="mb-7">{{ t('standalone.ssh.title') }}</NeHeading>
  <div class="flex max-w-3xl flex-col gap-y-8">
    <SshConfig />
    <hr />
    <SshKeys />
  </div>
</template>
