<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { NeLink, NeInlineNotification, NeButton } from '@nethesis/vue-components'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import MigrationDrawer from '@/components/standalone/backup_and_restore/MigrationDrawer.vue'
import FormLayout from '@/components/standalone/FormLayout.vue'

const { t } = useI18n()

let showMigrationDrawer = ref(false)
let successNotificationMigration = ref(false)

function successMigration() {
  successNotificationMigration.value = true
  setTimeout(function () {
    successNotificationMigration.value = false
  }, 5000)
}
</script>

<template>
  <div>
    <NeInlineNotification
      v-if="successNotificationMigration"
      class="my-4"
      kind="success"
      :title="t('standalone.backup_and_restore.migration.success_migration')"
    />
    <FormLayout class="max-w-6xl">
      <template #description>
        <div class="mb-8 text-sm font-normal text-gray-500 dark:text-gray-400">
          {{ t('standalone.backup_and_restore.migration.description') }}
          <div class="mt-4">
            <!-- <NeLink href="https://docs.nethsecurity.org/en/latest/migration.html" target="_blank">
              <FontAwesomeIcon class="mr-2" :icon="['fa', 'arrow-up-right-from-square']" />
              {{ t('standalone.backup_and_restore.migration.description_link') }}
            </NeLink> -->
          </div>
        </div>
      </template>
      <div class="flex">
        <div class="self-start mr-auto">
          <NeButton
            class="ml-6"
            kind="secondary"
            size="lg"
            type="submit"
            @click="showMigrationDrawer = true"
          >
            <template #prefix>
              <FontAwesomeIcon :icon="['fa', 'arrow-circle-up']" />
            </template>
            {{ t('standalone.backup_and_restore.migration.upload_file') }}
          </NeButton>
        </div>
      </div>
      <MigrationDrawer
        :showMigrationDrawer="showMigrationDrawer"
        @success="successMigration()"
        @close="showMigrationDrawer = false"
      />
    </FormLayout>
  </div>
</template>
