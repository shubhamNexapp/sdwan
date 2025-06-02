<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script lang="ts" setup>
defineProps({
  title: String,
  description: String
})
</script>

<template>
  <div class="flex flex-col md:flex-row">
    <div class="sm:mr-6 md:w-5/12">
      <h2 v-if="title || $slots.title" class="mb-2 text-lg font-medium">
        <slot name="title">
          {{ title }}
        </slot>
      </h2>
      <p
        v-if="description || $slots.description"
        class="mb-8 text-sm font-normal text-gray-500 dark:text-gray-400"
      >
        <slot name="description">
          {{ description }}
        </slot>
      </p>
    </div>
    <div class="md:w-7/12">
      <slot></slot>
    </div>
  </div>
</template>
