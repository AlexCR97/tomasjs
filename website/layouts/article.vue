<script setup lang="ts">
  const leftSidebarWidth = "300px";
  const rightSidebarWidth = "300px";
</script>

<template>
  <div class="d-flex w-100 h-100">
    <aside
      class="border-end h-100 overflow-y-auto d-none d-lg-block"
      :style="{ minWidth: leftSidebarWidth, width: leftSidebarWidth }"
    >
      <slot name="sidebarLeft"></slot>
    </aside>

    <main class="w-100 h-100 overflow-y-auto px-0 px-sm-3">
      <slot></slot>
    </main>

    <aside
      class="border-start h-100 overflow-y-auto d-none d-xl-block"
      :style="{ minWidth: rightSidebarWidth, width: rightSidebarWidth }"
    >
      <slot name="sidebarRight"></slot>
    </aside>
  </div>
</template>
