<script setup lang="ts">
import { MenuItem } from "utils";

const nextStepsSection: MenuItem = {
  id: "nextSteps",
  to: "#nextSteps",
  label: "Next Steps",
};

const onThisPageItems: MenuItem[] = [nextStepsSection];
</script>

<template>
  <NuxtLayout name="article">
    <template #sidebarLeft>
      <DocsSidebarLeft />
    </template>

    <main class="container py-4">
      <h3 class="mb-5">Middlewares</h3>

      <section
        :id="nextStepsSection.id"
        class="mb-5">
        <p class="fw-bold">{{ nextStepsSection.label }}</p>
        <ul>
          <li>
            <!-- TODO Insert link -->
            <NuxtLink to="#">Middlewares</NuxtLink>
          </li>
        </ul>
      </section>
    </main>

    <template #sidebarRight>
      <DocsSidebarRight :items="onThisPageItems" />
    </template>
  </NuxtLayout>
</template>
