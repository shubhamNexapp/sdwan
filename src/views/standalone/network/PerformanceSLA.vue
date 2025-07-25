<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script lang="ts" setup>
import { useI18n } from "vue-i18n";
import { NeHeading, NeTabs } from "@nethesis/vue-components";
import { useTabs } from "@/composables/useTabs";
import Zone from "./Zone.vue";
import BasicConfiguration from "./BasicConfiguration.vue";
import Rule from "./Rule.vue";

const { t } = useI18n();

const { tabs, selectedTab } = useTabs([
  {
    name: "zone",
    label: t("Zone"),
  },
  {
    name: "basic-configuration",
    label: t("Basic Configuration"),
  },
  {
    name: "rule",
    label: t("Rule"),
  },
]);
</script>
<template>
  <div>
    <div
      class="mb-3 flex flex-col justify-between gap-6 md:flex-row md:items-center"
    >
      <NeHeading tag="h3">
        {{ t("Performance SLA") }}
      </NeHeading>
    </div>
    <p
      class="mb-6 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400"
    >
      {{
        t(
          "Configure performance sla service settings, including redistribution of connected, static, and kernel"
        )
      }}
    </p>
    <NeTabs
      :tabs="tabs"
      :selected="selectedTab"
      :srTabsLabel="t('ne_tabs.tabs')"
      :srSelectTabLabel="t('ne_tabs.select_a_tab')"
      @selectTab="selectedTab = $event"
      class="mb-8"
    />
    <Zone v-if="selectedTab == 'zone'" />
    <BasicConfiguration v-else-if="selectedTab == 'basic-configuration'" />
    <Rule v-else-if="selectedTab == 'rule'" />
  </div>
</template>
