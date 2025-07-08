<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
    NeHeading,
    NeTabs,
} from '@nethesis/vue-components'
import { useTabs } from '@/composables/useTabs'
import ProgramSetting from './ProgramSetting.vue'
import RuleSetting from './RuleSetting.vue'

const { t } = useI18n()

const { tabs, selectedTab } = useTabs([
    {
        name: 'program-setting',
        label: t('Program Setting')
    },
    {
        name: 'rule-setting',
        label: t('Rule Setting')
    },
])

</script>
<template>
    <div>
        <div class="flex flex-col justify-between gap-6 mb-3 md:flex-row md:items-center">
            <NeHeading tag="h3">
                {{ t('Anti Spam') }}
            </NeHeading>
        </div>
        <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure Anti Spam settings, including server connection details, user credentials, and manage client tunnels.') }}
        </p>
        <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
            :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
        <ProgramSetting v-if="selectedTab == 'program-setting'" />
        <RuleSetting v-else-if="selectedTab == 'rule-setting'" />
    </div>
</template>
