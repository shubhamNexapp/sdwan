<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import {
  kbpsFormat,
  NeCard,
  NeEmptyState,
  NePaginator,
  NeTable,
  NeTableBody,
  NeTableCell,
  NeTableHead,
  NeTableHeadCell,
  NeTableRow,
  NeTextInput,
  useItemPagination
} from '@nethesis/vue-components'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { type TopHost } from '@/composables/useTopTalkers'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { refDebounced } from '@vueuse/core'

const { topHosts } = defineProps<{
  topHosts: TopHost[]
}>()

const { t } = useI18n()

const filter = ref('')
const filterDebounced = refDebounced(filter, 400)

const filteredItems = computed<TopHost[]>(() => {
  return topHosts.filter((item) =>
    item.host.toLowerCase().includes(filterDebounced.value.toLowerCase())
  )
})

const pageSize = ref(10)
const { currentPage, paginatedItems } = useItemPagination(() => filteredItems.value, {
  itemsPerPage: pageSize
})

function formatTraffic(value: number) {
  return kbpsFormat((value / 1000) * 8)
}
</script>

<template>
  <NeCard :title="t('standalone.real_time_monitor.local_hosts')">
    <div class="mb-3 sm:max-w-xs">
      <NeTextInput v-model="filter" :placeholder="t('common.filter')">
        <template #prefix>
          <FontAwesomeIcon :icon="faSearch" aria-hidden="true" class="h-4 w-4" />
        </template>
      </NeTextInput>
    </div>
    <NeTable
      :ariaLabel="t('standalone.real_time_monitor.local_hosts')"
      cardBreakpoint="sm"
      class="mt-2"
    >
      <NeTableHead>
        <NeTableHeadCell>{{ t('standalone.real_time_monitor.host') }}</NeTableHeadCell>
        <NeTableHeadCell>{{ t('standalone.real_time_monitor.traffic') }}</NeTableHeadCell>
      </NeTableHead>
      <NeTableBody>
        <NeTableRow v-if="!paginatedItems.length">
          <NeTableCell colspan="9">
            <NeEmptyState
              :title="t('common.no_data_available')"
              :icon="['fas', 'table']"
              class="bg-white dark:bg-gray-950"
            />
          </NeTableCell>
        </NeTableRow>
        <NeTableRow v-else v-for="(item, index) in paginatedItems" :key="index">
          <NeTableCell :data-label="t('standalone.real_time_monitor.host')">
            {{ item.host }}
          </NeTableCell>
          <NeTableCell :data-label="t('standalone.real_time_monitor.traffic')">
            {{ formatTraffic(item.totals.bandwidth) }}
          </NeTableCell>
        </NeTableRow>
      </NeTableBody>
      <template #paginator>
        <NePaginator
          :current-page="currentPage"
          :total-rows="topHosts.length"
          :page-size="pageSize"
          :page-sizes="[5, 10]"
          :nav-pagination-label="t('ne_table.pagination')"
          :next-label="t('ne_table.go_to_next_page')"
          :previous-label="t('ne_table.go_to_previous_page')"
          :range-of-total-label="t('ne_table.of')"
          :page-size-label="t('ne_table.show')"
          @select-page="
            (page: number) => {
              currentPage = page
            }"
          @selectPageSize="
            (size: number) => {
              pageSize = size
            }"
        />
      </template>
    </NeTable>
  </NeCard>
</template>
