<script setup lang="ts">
  import { MenuItem } from "utils";

  const emit = defineEmits<{
    (e: "onLinkClick"): void;
  }>();

  const gettingStartedItems: MenuItem[] = [
    {
      label: "Your first TomasJS Console app",
      to: "/docs/first-app",
    },
  ];

  const fundamentalsItems: MenuItem[] = [
    {
      label: "Dependency Injection",
      to: "/docs/fundamentals/dependency-injection",
    },
    {
      label: "CQRS",
    },
    {
      label: "Configuration",
    },
    {
      label: "Errors",
    },
    {
      label: "Logging",
    },
  ];

  const webApiItems: MenuItem[] = [
    {
      label: "Your first TomasJS Web API",
    },
    {
      label: "ExpressAppBuilder",
    },
    {
      label: "Controllers",
    },
    {
      label: "Middlewares",
    },
    {
      label: "Guards",
    },
    {
      label: "JWT Authentication",
    },
    {
      label: "Error Handling",
    },
    {
      label: "File Uploads",
      to: "/docs/web-api/file-uploads",
    },
  ];

  function onLinkClick() {
    emit("onLinkClick");
  }
</script>

<template>
  <div class="p-3">
    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">Getting started</p>
      <ul>
        <li v-for="item of gettingStartedItems">
          <NuxtLink :to="item.to" @click.native="onLinkClick">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">Fundamentals</p>
      <ul>
        <li v-for="item of fundamentalsItems">
          <NuxtLink :to="item.to" @click.native="onLinkClick">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">Develop a Web API</p>
      <ul>
        <li v-for="item of webApiItems">
          <NuxtLink :to="item.to" @click.native="onLinkClick">{{ item.label }}</NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">Database Clients</p>
      <ul>
        <li>
          <NuxtLink @click.native="onLinkClick">TODO</NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">HTTP Client</p>
      <ul>
        <li>
          <NuxtLink @click.native="onLinkClick">TODO</NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">Message Brokers</p>
      <ul>
        <li>
          <NuxtLink @click.native="onLinkClick">TODO</NuxtLink>
        </li>
      </ul>
    </section>

    <section class="mb-4">
      <p class="fw-bold m-0 mb-2">Web Sockets</p>
      <ul>
        <li>
          <NuxtLink @click.native="onLinkClick">TODO</NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
  .router-link-exact-active {
    color: #12b488;
  }
</style>
