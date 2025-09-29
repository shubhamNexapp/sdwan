<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { NeCard, NeButton } from "@nethesis/vue-components";

const props = defineProps<{
  rule: {
    rule_name: string;
    enabled: boolean;
    action: string;
    group: string;
    app_name: string[];
    describe: string;
  };
}>();

const emit = defineEmits(["edit", "delete"]);
const { t } = useI18n();
</script>

<template>
  <NeCard
    :menuItems="[
      {
        id: 'delete',
        label: t('common.delete'),
        icon: 'trash',
        iconStyle: 'fas',
        action: () => emit('delete', rule),
        danger: true,
      },
    ]"
    class="border-l-4 border-green-400 dark:border-green-500"
  >
    <!-- Title -->
    <template #title>
      <div :class="{ 'opacity-50': !rule.enabled }">
        <span class="font-semibold">{{ rule.rule_name }}</span>
      </div>
    </template>

    <!-- Edit button -->
    <template #topRight>
      <NeButton kind="tertiary" size="lg" @click="emit('edit', rule)">
        <template #prefix>
          <font-awesome-icon :icon="['fas', 'pen-to-square']" />
        </template>
        {{ t("common.edit") }}
      </NeButton>
    </template>

    <!-- Content -->
    <div :class="{ 'opacity-50': !rule.enabled }">
      <!-- Enabled/Disabled -->
      <div v-if="rule.enabled" class="flex items-center text-green-600">
        <font-awesome-icon :icon="['fas', 'circle-check']" class="mr-2" />
        <span>{{ t("common.enabled") }}</span>
      </div>
      <div v-else class="flex items-center text-red-500">
        <font-awesome-icon :icon="['fas', 'circle-xmark']" class="mr-2" />
        <span>{{ t("common.disabled") }}</span>
      </div>

      <!-- Rule Details -->
      <NeCard alternateBackground class="mt-4 p-2 space-y-2">
        <p><b>{{ t("Action") }}:</b> {{ rule.action }}</p>
        <p><b>{{ t("Group") }}:</b> {{ rule.group }}</p>

        <div>
          <b>{{ t("Applications") }}:</b>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="app in rule.app_name"
              :key="app"
              class="px-3 py-1 rounded-lg bg-indigo-100 text-sm font-medium text-indigo-800 shadow-sm dark:bg-indigo-900 dark:text-indigo-200"
            >
              {{ app }}
            </span>
          </div>
        </div>

        <p><b>{{ t("Description") }}:</b> {{ rule.describe }}</p>
      </NeCard>
    </div>
  </NeCard>
</template>
