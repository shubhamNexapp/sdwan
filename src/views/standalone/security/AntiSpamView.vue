<script lang="ts" setup>
import { useI18n } from 'vue-i18n'
import {
    NeHeading,
    NeTabs,
    NeButton
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

const saveRule = () => {
  const serverIP = window.location.hostname
  console.log("serverIP======",serverIP)
  const fileUrl = `https://${serverIP}:9090/files/server.crt`
  console.log("fileUrl======",fileUrl)

  const link = document.createElement('a')
  link.href = fileUrl
  link.download = 'server.crt'
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

</script>
<template>
    <div>
        <div class="flex flex-col justify-between gap-6 mb-3 md:flex-row md:items-center">
            <NeHeading tag="h3">
                {{ t('Anti Spam') }}
            </NeHeading>
            <!-- Download Button -->

            <NeButton kind="secondary" @click.prevent="saveRule">
                Download Certificate
            </NeButton>

        </div>
        <p class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
            {{ t('Configure Anti Spam settings, including server connection details, user credentials, and manage') }}
        </p>
        <NeTabs :tabs="tabs" :selected="selectedTab" :srTabsLabel="t('ne_tabs.tabs')"
            :srSelectTabLabel="t('ne_tabs.select_a_tab')" @selectTab="selectedTab = $event" class="mb-8" />
        <ProgramSetting v-if="selectedTab == 'program-setting'" />
        <RuleSetting v-else-if="selectedTab == 'rule-setting'" />
    </div>
</template>
