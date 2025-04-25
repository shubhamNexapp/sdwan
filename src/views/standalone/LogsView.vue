<script lang="ts" setup>
import {
  NeCombobox,
  type NeComboboxOption,
  NeHeading,
  NeInlineNotification,
  NeTooltip,
  NeTextInput,
  getAxiosErrorMessage
} from '@nethesis/vue-components'
import { NeToggle } from '@nethesis/vue-components'
import { useI18n } from 'vue-i18n'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { ubusCall, ValidationError } from '@/lib/standalone/ubus'
import type { AxiosResponse } from 'axios'
import { MessageBag } from '@/lib/validation'
import * as XLSX from 'xlsx'


interface LogResponse {
  values: string[]
}

const logLimitComboboxOption: NeComboboxOption[] = [
  {
    id: '100',
    label: '100'
  },
  {
    id: '200',
    label: '200'
  },
  {
    id: '500',
    label: '500'
  },
  {
    id: '1000',
    label: '1000'
  }
]

const { t } = useI18n()

const limit = ref(logLimitComboboxOption[0].id)
const wrapRow = ref(true)
const search = ref('')
const pool = ref(false)
const poolInterval = ref<number>()
const errorBag = ref(new MessageBag())

const logRef = ref<HTMLUListElement | null>(null)

const data = ref<Array<string>>()
const error = ref<Error>()
const loading = ref(false)

const logRowStyle = computed(() => {
  return wrapRow.value ? 'break-all' : 'whitespace-nowrap'
})

watch(data, () => {
  setTimeout(() => {
    if (logRef.value != null) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  }, 50)
})

watch([limit, search], () => {
  fetchData()
})

watch(pool, () => {
  if (pool.value) {
    fetchData()
    poolInterval.value = setInterval(() => {
      fetchData()
    }, 2500)
  } else {
    clearInterval(poolInterval.value)
  }
})

onMounted(() => {
  fetchData()
})

onUnmounted(() => {
  if (poolInterval.value) {
    clearInterval(poolInterval.value)
  }
})

function fetchData() {
  // reset status
  error.value = undefined
  errorBag.value.clear()
  loading.value = true
  // api call
  ubusCall('ns.log', 'get-log', {
    search: search.value,
    limit: limit.value
  })
    .then((response: AxiosResponse<LogResponse>) => {
      data.value = response.data.values
    })
    .catch((reason: Error) => {
      if (reason instanceof ValidationError) {
        if (reason.errorBag.has('search')) {
          errorBag.value.set('search', t('standalone.logs.search_error'))
        }
        if (reason.errorBag.has('limit')) {
          errorBag.value.set('limit', t('standalone.logs.limit_error'))
        }
      } else {
        // generic error, show in UI
        error.value = reason
      }
    })
    .finally(() => (loading.value = false))
}

function highlightMatch(entry: string): string {
  if (!search.value) return entry
  const escapedSearch = search.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape special regex chars
  const regex = new RegExp(`(${escapedSearch})`, 'gi')
  return entry.replace(regex, `<span class="bg-yellow-200 text-black font-semibold">$1</span>`)
}

function downloadLogsAsExcel() {
  if (!data.value || data.value.length === 0) return

  const worksheetData = data.value.map((log, index) => ({
    'S.No': index + 1,
    'Log Entry': log
  }))

  const worksheet = XLSX.utils.json_to_sheet(worksheetData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs')

  XLSX.writeFile(workbook, 'Logs.xlsx')
}


</script>

<template>
  <h1 class="mb-4 text-xl font-semibold">Logs</h1>
  <p class="mb-2 max-w-2xl text-sm font-normal text-gray-500 dark:text-gray-400">
    {{ t('standalone.ping_latency_monitor.description') }}
  </p>
  <div class="flex justify-end">
    <button @click="downloadLogsAsExcel"
      class="group relative rounded-full p-2 hover:bg-blue-100 dark:hover:bg-gray-800 transition duration-200"
      aria-label="Download Logs">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 group-hover:text-blue-800" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round"
          d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" />
      </svg>
      <span
        class="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 rounded bg-gray-700 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
        Download Logs
      </span>
    </button>
  </div>
  <div class="">
    <div class="grid grid-cols-1 gap-6 sm:max-w-xl sm:grid-cols-2">
      <NeTextInput v-model="search" :invalid-message="errorBag.getFirstFor('search')"
        :label="t('standalone.logs.search')" :placeholder="t('standalone.logs.search_placeholder')">
        <template #tooltip>
          <NeTooltip>
            <template #content>
              {{ t('standalone.logs.search_tooltip') }}
            </template>
          </NeTooltip>
        </template>
      </NeTextInput>
      <NeCombobox v-model="limit" :invalid-message="errorBag.getFirstFor('limits')"
        :label="t('standalone.logs.limit_rows')" :options="logLimitComboboxOption"
        :noResultsLabel="t('ne_combobox.no_results')" :limitedOptionsLabel="t('ne_combobox.limited_options_label')"
        :noOptionsLabel="t('ne_combobox.no_options_label')" :selected-label="t('ne_combobox.selected')"
        :user-input-label="t('ne_combobox.user_input_label')" :optionalLabel="t('common.optional')" />
      <div class="col-span-1 flex gap-8 sm:col-span-2">
        <NeToggle v-model="wrapRow" :label="t('standalone.logs.wrap_row')" />
        <NeToggle v-model="pool" :label="t('standalone.logs.pooling')" />

      </div>
    </div>


    <br>
    <NeInlineNotification v-if="error" :description="error.message" :title="t(getAxiosErrorMessage(error))"
      kind="error" />
    <ul ref="logRef"
      class="max-h-[70vh] max-w-6xl divide-y divide-gray-300 overflow-y-scroll rounded-md border border-gray-300 font-mono text-xs dark:divide-gray-600 dark:border-gray-600">
      <li v-for="(entry, index) in data" :key="index" :class="logRowStyle" class="odd:bg-gray-100 odd:dark:bg-gray-950">
        <span v-html="highlightMatch(entry)"></span>
      </li>
    </ul>
  </div>
</template>
