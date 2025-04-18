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
    <div class="space-y-8">
        <NeHeading tag="h3">{{ t('Anti Virus') }}</NeHeading>
        <NeTabs :selected="selectedTab" :srSelectTabLabel="t('ne_tabs.select_a_tab')" :srTabsLabel="t('ne_tabs.tabs')"
            :tabs="tabs" @selectTab="selectedTab = $event" />
        <Setting v-if="selectedTab == 'setting'" />
        <IsolateFile v-if="selectedTab == 'isolate_file'" />
    </div>
</template>
