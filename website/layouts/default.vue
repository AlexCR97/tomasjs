<script setup lang="ts">
  const route = useRoute();
</script>

<template>
  <div class="w-100 d-flex flex-column" style="height: 100vh">
    <AppHeader />

    <div class="w-100 h-100 overflow-y-auto">
      <slot></slot>

      <!-- TODO Figure out a better way to display AppFooter -->
      <AppFooter v-if="route.path === '/'" />
    </div>
  </div>
</template>
