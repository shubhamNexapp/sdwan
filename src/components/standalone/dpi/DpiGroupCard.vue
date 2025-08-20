<!-- DpiGroupCard.vue -->
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { NeCard, NeButton } from "@nethesis/vue-components";

const props = defineProps<{
  group: {
    group_name: string;
    ip: { network: string }[];
    enabled: boolean;
  };
}>();

const emit = defineEmits(["edit", "delete"]);
const { t } = useI18n();

console.log("Group Card Props:==", props.group.group_name);
</script>

<template>
  <NeCard
    :menuItems="[
      {
        id: 'delete',
        label: t('common.delete'),
        icon: 'trash',
        iconStyle: 'fas',
        action: () => emit('delete', group),
        danger: true,
      },
    ]"
    class="border-l-4 border-green-400 dark:border-indigo-500"
  >
    <!-- Header -->
    <template #header>
      <div :class="{ 'opacity-50': !group.enabled }">
        <span class="font-semibold">{{ props.group.group_name }}</span>
      </div>
    </template>

    <!-- Top Right -->
    <template #topRight>
      <NeButton kind="tertiary" size="lg" @click="emit('edit', group)">
        <template #prefix>
          <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" />
        </template>
        {{ t("common.edit") }}
      </NeButton>
    </template>

        <div class="divide-y divide-gray-300 dark:divide-gray-600">
            {{ group.group_name }}
        </div>

    <!-- Status -->
    <div :class="{ 'opacity-50': !group.enabled }" class="mt-2">
      <div v-if="group.enabled" class="flex items-center text-green-600">
        <font-awesome-icon
          :icon="['fas', 'circle-check']"
          class="mr-2 h-4 w-4"
        />
        <span>{{ t("common.enabled") }}</span>
      </div>
      <div v-else class="flex items-center text-red-500">
        <font-awesome-icon
          :icon="['fas', 'circle-xmark']"
          class="mr-2 h-4 w-4"
        />
        <span>{{ t("common.disabled") }}</span>
      </div>

      <!-- IP Networks -->
      <NeCard alternateBackground class="mt-4">
        <div class="divide-y divide-gray-300 dark:divide-gray-600">
          <p v-for="(ipItem, idx) in group.ip" :key="idx" class="py-1 text-sm">
            {{ ipItem.network }}
          </p>
        </div>
      </NeCard>
    </div>
  </NeCard>
</template>
