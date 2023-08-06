<script setup lang="ts">
  const leftSidebarWidth = "400px";
  const rightSidebarWidth = "400px";
</script>

<template>
  <div class="d-flex w-100 h-100">
    <aside class="border-end" :style="{ width: leftSidebarWidth }">
      <slot name="sidebarLeft"></slot>
    </aside>

    <main class="w-100">
      <slot></slot>
    </main>

    <aside class="border-start" :style="{ width: rightSidebarWidth }">
      <slot name="sidebarRight"></slot>
    </aside>
  </div>
</template>
