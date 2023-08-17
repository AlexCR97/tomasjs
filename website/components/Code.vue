<script setup lang="ts">
  const props = defineProps<{
    title?: string;
  }>();
</script>

<template>
  <div class="card">
    <div v-if="props.title" class="card-header" style="font-size: 0.9rem">
      <code class="m-0.p-0">
        {{ props.title }}
      </code>
    </div>
    <div class="card-body m-0 p-0 px-3 pt-3">
      <code class="m-0 p-0">
        <slot></slot>
      </code>
    </div>
  </div>
</template>
