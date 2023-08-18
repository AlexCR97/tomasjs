<script setup lang="ts">
  const leftSidebarWidth = "300px";
  const rightSidebarWidth = "300px";
</script>

<template>
  <div class="d-flex w-100 h-100">
    <aside
      class="border-end h-100 overflow-y-auto"
      :style="{ minWidth: leftSidebarWidth, width: leftSidebarWidth }"
    >
      <slot name="sidebarLeft"></slot>
    </aside>

    <main class="w-100 h-100 overflow-y-auto px-3">
      <slot></slot>
    </main>

    <aside
      class="border-start h-100 overflow-y-auto"
      :style="{ minWidth: rightSidebarWidth, width: rightSidebarWidth }"
    >
      <slot name="sidebarRight"></slot>
    </aside>
  </div>
</template>
