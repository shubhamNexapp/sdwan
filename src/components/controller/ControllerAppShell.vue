<!--
  Copyright © 2024-2026 Nexapp Technologies Pvt Ltd. All rights reserved.
-->

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Dialog, DialogPanel, TransitionChild, TransitionRoot } from '@headlessui/vue'
import { ref } from 'vue'
import SideMenu from './SideMenu.vue'
import ControllerTopBar from './ControllerTopBar.vue'
import NotificationDrawer from '../NotificationDrawer.vue'
import ToastNotificationsArea from '../ToastNotificationsArea.vue'
import router from '@/router'
import ControllerShellLogo from './ControllerShellLogo.vue'

const { t } = useI18n()

const sidebarOpen = ref(false)
</script>

<template>
  <div>
    <template
      v-if="
        router.currentRoute.value.path.includes('/controller/manage') ||
        router.currentRoute.value.path.includes('/controller/unit-terminal')
      "
    >
      <!-- hide controller shell in some page -->
      <RouterView />
    </template>
    <template v-else>
      <!-- controller shell -->

      <!-- sidebar for mobile  -->
      <TransitionRoot as="template" :show="sidebarOpen">
        <Dialog as="div" class="relative z-50 lg:hidden" @close="sidebarOpen = false">
          <TransitionChild
            as="template"
            enter="transition-opacity ease-linear duration-300"
            enter-from="opacity-0"
            enter-to="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leave-from="opacity-100"
            leave-to="opacity-0"
          >
            <div class="fixed inset-0 bg-gray-900/80 dark:bg-gray-900/80" />
          </TransitionChild>

          <div class="fixed inset-0 flex">
            <TransitionChild
              as="template"
              enter="transition ease-in-out duration-300 transform"
              enter-from="-translate-x-full"
              enter-to="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leave-from="translate-x-0"
              leave-to="-translate-x-full"
            >
              <DialogPanel class="relative flex flex-1 w-full max-w-xs mr-16">
                <TransitionChild
                  as="template"
                  enter="ease-in-out duration-300"
                  enter-from="opacity-0"
                  enter-to="opacity-100"
                  leave="ease-in-out duration-300"
                  leave-from="opacity-100"
                  leave-to="opacity-0"
                >
                  <div class="absolute top-0 flex justify-center w-16 pt-5 left-full">
                    <button type="button" class="-m-2.5 p-2.5" @click="sidebarOpen = false">
                      <span class="sr-only">{{ t('common.shell.close_sidebar') }}</span>
                      <font-awesome-icon
                        :icon="['fas', 'xmark']"
                        class="w-6 h-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </TransitionChild>
                <!-- Sidebar component -->
                <div
                  class="flex flex-col px-2 pb-4 overflow-y-auto bg-white grow gap-y-5 dark:bg-gray-950"
                >
                  <ControllerShellLogo />
                  <nav class="flex flex-col flex-1">
                    <ul role="list" class="flex flex-col flex-1 gap-y-7">
                      <li>
                        <ul role="list" class="space-y-1">
                          <SideMenu />
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </TransitionRoot>

      <!-- Static sidebar for desktop -->
      <div class="hidden lg:fixed lg:z-50 lg:flex lg:h-screen lg:w-72 lg:flex-col">
        <!-- Sidebar component -->
        <div
          class="flex flex-col px-2 pb-4 overflow-y-auto bg-white border-r border-gray-200 side-bar grow gap-y-5 dark:border-gray-700 dark:bg-gray-950"
        >
          <ControllerShellLogo />
          <nav class="flex flex-col flex-1">
            <ul role="list" class="flex flex-col flex-1 gap-y-7">
              <li>
                <ul role="list" class="space-y-2">
                  <SideMenu />
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div class="lg:pl-72">
        <ControllerTopBar @openSidebar="sidebarOpen = true" />
        <main class="py-10">
          <div class="px-4 sm:px-6 lg:px-8">
            <RouterView />
          </div>
        </main>
      </div>
      <NotificationDrawer :closeOnClickOutside="true" />
      <ToastNotificationsArea />
    </template>
  </div>
</template>
