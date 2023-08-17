<script setup lang="ts">
  import { MenuItem } from "utils";

  defineProps<{
    items: MenuItem[];
  }>();
</script>

<template>
  <div class="p-3">
    <p class="fw-bold m-0 mb-2">On this page:</p>
    <ul>
      <li v-for="item of items">
        <NuxtLink :to="item.to" external>{{ item.label }}</NuxtLink>
      </li>
    </ul>
  </div>
</template>
