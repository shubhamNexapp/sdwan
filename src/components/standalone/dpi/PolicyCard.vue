<!-- PolicyCard.vue -->
<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { NeCard, NeButton } from "@nethesis/vue-components";

const props = defineProps<{
  rule: {
    rule_name: string;
    enabled: boolean;
    action: string;
    src_ip: string[];
    app_name: string[];
    type: string;
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
        <!-- <span class="font-semibold">{{ rule.rule_name }}</span> -->
      </div>
    </template>

    <!-- Top Right Edit -->
    <template #topRight>
      <NeButton kind="tertiary" size="lg" @click="emit('edit', rule)">
        <template #prefix>
          <font-awesome-icon :icon="['fas', 'pen-to-square']" class="h-4 w-4" />
        </template>
        {{ t("common.edit") }}
      </NeButton>
    </template>

    <!-- Content -->
    <div :class="{ 'opacity-50': !rule.enabled }">
      <!-- Enabled/Disabled -->
      <div v-if="rule.enabled" class="flex items-center text-green-600">
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

      <!-- Rule details -->
      <NeCard alternateBackground class="mt-4">
        <div
          class="space-y-2 divide-y divide-gray-300 p-2 dark:divide-gray-600"
        >
          <!-- <p>
            <b>{{ t("Action") }}:</b> {{ rule.action }}
          </p>
          <p>
            <b>{{ t("Type") }}:</b> {{ rule.type }}
          </p> -->
          <p>
            <b>{{ t("Source IPs") }}:</b> {{ rule.src_ip.join(", ") }}
          </p>

          <!-- Applications list -->
          <div>
            <b>{{ t("Applications") }}:</b>
            <div class="mt-2 flex flex-wrap gap-2">
              <span
                v-for="app in rule.app_name"
                :key="app"
                class="rounded-lg bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800 shadow-sm dark:bg-indigo-900 dark:text-indigo-200"
              >
                {{ app }}
              </span>
            </div>
          </div>

          <p>
            <b>{{ t("Description") }}:</b> {{ rule.describe }}
          </p>
        </div>
      </NeCard>
    </div>
  </NeCard>
</template>
