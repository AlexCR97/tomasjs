<script setup lang="ts"></script>

<template>
  <div>
    <NuxtLayout name="article">
      <template #sidebarLeft>
        <DocsSidebarLeft />
      </template>

      <main class="container py-4">
        <h3>Your first TomasJS app</h3>
      </main>

      <template #sidebarRight>
        <DocsSidebarRight />
      </template>
    </NuxtLayout>
  </div>
</template>
