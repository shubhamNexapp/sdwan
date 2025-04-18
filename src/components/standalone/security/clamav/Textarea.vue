<template>
    <textarea :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" v-bind="$attrs" />
</template>

<script setup>
defineProps({
    modelValue: {
        type: String,
        default: ''
    }
});

defineEmits(['update:modelValue']);
</script>