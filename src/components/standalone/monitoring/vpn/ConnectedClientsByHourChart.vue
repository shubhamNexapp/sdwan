<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'
import { Bar } from 'vue-chartjs'
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { GRAY_200, GRAY_700, GRAY_800 } from '@/lib/color'

const themeStore = useThemeStore()

const props = defineProps<{
  labels: string[]
  datasets: any[]
  height?: string
}>()

const options: any = {
  scales: {
    x: {
      ticks: {
        source: 'auto',
        autoSkip: true,
        color: themeStore.isLight ? GRAY_700 : GRAY_200,
        callback: function (value: any) {
          const label = (this as any).getLabelForValue(value)
          return `${label.toString().padStart(2, '0')}:00`
        }
      },
      grid: {
        color: themeStore.isLight ? GRAY_200 : GRAY_800
      }
    },
    y: {
      ticks: {
        color: themeStore.isLight ? GRAY_700 : GRAY_200
      },
      grid: {
        color: themeStore.isLight ? GRAY_200 : GRAY_800
      }
    }
  },
  plugins: {
    decimation: {
      enabled: true,
      algorithm: 'min-max'
    },
    tooltip: {
      callbacks: {
        // format tooltip title
        title: function (context: any) {
          return `${context[0].label.padStart(2, '0')}:00`
        }
      }
    },
    // hide legend
    legend: {
      display: false
    }
  },
  responsive: true
}

const chartData: any = computed(() => {
  return { labels: props.labels, datasets: props.datasets }
})

const chartStyle = computed(() => {
  return {
    height: props.height || '',
    width: '100%',
    position: 'relative'
  }
})

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
</script>

<template>
  <div>
    <Bar :data="chartData" :options="options" :style="chartStyle" />
  </div>
</template>
