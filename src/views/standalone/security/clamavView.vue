<!--
  Copyright (C) 2025 Nethesis S.r.l.
  SPDX-License-Identifier: GPL-3.0-or-later
-->

<script lang="ts" setup>
import { NeHeading, NeTabs } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import { useTabs } from '@/composables/useTabs'
import Setting from '@/components/standalone/security/clamav/setting.vue'
import IsolateFile from '@/components/standalone/security/clamav/isolateFile.vue'


const { t } = useI18n()
const { tabs, selectedTab } = useTabs([
    { name: 'setting', label: t('Setting') },
    { name: 'isolate_file', label: t('Isolate File') }
])
</script>

<template>
    <NeHeading class="mb-4" tag="h3">{{ t('Anti Virus') }}</NeHeading>
    <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
        {{ t('Configure antivirus settings, including scan paths, intervals, and service status, and manage file isolation and scanning tasks.') }}
    </p>
    <div class="space-y-8">
        <NeTabs :selected="selectedTab" :srSelectTabLabel="t('ne_tabs.select_a_tab')" :srTabsLabel="t('ne_tabs.tabs')"
            :tabs="tabs" @selectTab="selectedTab = $event" />
        <Setting v-if="selectedTab == 'setting'" />
        <IsolateFile v-if="selectedTab == 'isolate_file'" />
    </div>
</template>
