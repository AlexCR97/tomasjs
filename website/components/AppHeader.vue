<script setup lang="ts">
  import { Offcanvas } from "bootstrap";

  const route = useRoute();
  const offcanvasEl = ref<HTMLElement>();
  const offcanvas = ref<Offcanvas>();

  onMounted(async () => {
    const bootstrap = await import("bootstrap");
    offcanvas.value = new bootstrap.Offcanvas(offcanvasEl.value!);
  });

  function onLinkClick() {
    offcanvas.value?.hide();
  }
</script>

<template>
  <div>
    <header class="border-bottom d-flex align-items-center px-4 py-3">
      <Icon
        v-if="route.path !== '/'"
        name="list"
        class="d-block d-lg-none me-4"
        data-bs-toggle="offcanvas"
        data-bs-target="#docsSidebarLeftOffcanvas"
        role="button"
      />
      <div class="d-flex align-items-center me-3" role="button">
        <img
          class="me-2"
          src="~/assets/img/logo.webp"
          alt="TomasJS logo"
          style="border-radius: 100%; width: 35px; height: 35px"
        />
        <p class="fw-bold m-0 p-0" style="font-size: 1.2rem">TomasJS</p>
      </div>
      <ul class="d-flex align-items-center w-100 m-0 p-0" style="list-style: none">
        <li class="me-3">
          <NuxtLink to="/">Home</NuxtLink>
        </li>
        <li class="me-3">
          <NuxtLink to="/docs/first-app">Docs</NuxtLink>
        </li>
      </ul>
    </header>

    <div
      ref="offcanvasEl"
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="docsSidebarLeftOffcanvas"
      style="max-width: 80vw"
    >
      <div class="offcanvas-header justify-content-end">
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
      </div>
      <div class="offcanvas-body">
        <DocsSidebarLeft @on-link-click="onLinkClick" />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .router-link-exact-active {
    color: #12b488;
  }
</style>
