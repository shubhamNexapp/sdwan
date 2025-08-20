<script setup lang="ts">
import { onMounted, ref } from "vue";
import {
  NeHeading,
  NeButton,
  NeTable,
  NeTableHead,
  NeTableHeadCell,
  NeTableBody,
  NeTableRow,
  NeTableCell,
  NeInlineNotification,
  NeSkeleton,
} from "@nethesis/vue-components";
import { getSDControllerApiEndpoint } from "@/lib/config";
import axios from "axios";
import { useNotificationsStore } from "@/stores/notifications";

const files = ref<string[]>([]);
const loading = ref(true);
const error = ref("");
const notificationsStore = useNotificationsStore();

// Fetch list of isolate files
const getLists = async () => {
  try {
    loading.value = true;
    error.value = "";
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/clamav`,
      {
        method: "get-config",
        payload: {},
      }
    );

    console.log("Isolate files response:===", response.data);

    if (response.data.code === 200) {
      const isolateFileString = response.data.data.isolate_file || "";
      files.value = isolateFileString
        ? isolateFileString
            .split(",")
            .map((f : any) => f.trim())
            .filter(Boolean)
        : [];
    }
  } catch (err: any) {
    error.value = err.message || "Failed to load isolate files";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getLists();
});

// Recover file
const recover = async (file: string) => {
  try {
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/clamav`,
      {
        method: "action-config",
        payload: { file_name: file, action: "recovery" },
      }
    );
    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: `File "${file}" recovered successfully.`,
        kind: "success",
      });
      await getLists();
    }
  } catch (err) {
    notificationsStore.createNotification({
      title: "Error",
      description: "Failed to recover file.",
      kind: "error",
    });
  }
};

// Delete file
const deleteFile = async (file: string) => {
  try {
    const response = await axios.post(
      `${getSDControllerApiEndpoint()}/clamav`,
      {
        method: "action-config",
        payload: { file_name: file, action: "delete" },
      }
    );
    if (response.data.code === 200) {
      notificationsStore.createNotification({
        title: "Success",
        description: `File "${file}" deleted successfully.`,
        kind: "success",
      });
      await getLists();
    }
  } catch (err) {
    notificationsStore.createNotification({
      title: "Error",
      description: "Failed to delete file.",
      kind: "error",
    });
  }
};
</script>

<template>
  <div class="flex flex-col">
    <div class="flex flex-col justify-between md:flex-row md:items-center">
      <NeHeading tag="h3" class="mb-7">Isolate Files</NeHeading>
    </div>

    <!-- Error notification -->
    <NeInlineNotification
      v-if="error"
      kind="error"
      title="Error"
      :description="error"
      class="mb-4"
    />

    <!-- Loading -->
    <NeSkeleton v-if="loading" :lines="5" size="lg" />

    <!-- Table -->
    <template v-else>
      <NeTable cardBreakpoint="md" class="mt-2">
        <NeTableHead>
          <NeTableHeadCell>#</NeTableHeadCell>
          <NeTableHeadCell>Isolate File</NeTableHeadCell>
          <NeTableHeadCell>Operations</NeTableHeadCell>
        </NeTableHead>
        <NeTableBody>
          <NeTableRow v-for="(file, index) in files" :key="index">
            <NeTableCell>{{ index + 1 }}</NeTableCell>
            <NeTableCell>{{ file }}</NeTableCell>
            <NeTableCell>
              <div class="flex gap-2">
                <NeButton
                  kind="primary"
                  size="sm"
                  @click.prevent="recover(file)"
                >
                  Recovery
                </NeButton>
                <NeButton
                  kind="tertiary"
                  size="sm"
                  @click.prevent="deleteFile(file)"
                >
                  Delete
                </NeButton>
              </div>
            </NeTableCell>
          </NeTableRow>
        </NeTableBody>
      </NeTable>

      <!-- Empty state -->
      <div v-if="files.length === 0" class="mt-4 text-sm text-gray-500">
        No isolate files found.
      </div>
    </template>
  </div>
</template>
