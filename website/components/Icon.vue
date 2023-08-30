<script setup lang="ts">
  defineProps<{
    name: string;
    size?: string;
  }>();
</script>

<template>
  <i :class="`bi bi-${name}`" :style="{ fontSize: size }"></i>
</template>
