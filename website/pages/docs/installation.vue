<script setup lang="ts"></script>

<template>
  <div>
    <NuxtLayout name="article">
      <template #sidebarLeft>
        <DocsSidebarLeft />
      </template>

      <main class="container py-4">
        <h3>Installation</h3>
      </main>

      <template #sidebarRight>
        <DocsSidebarRight />
      </template>
    </NuxtLayout>
  </div>
</template>
