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
    <header class="border-bottom px-4 py-3">
      <div class="row m-0 p-0">
        <div class="col m-0 p-0">
          <Icon
            v-if="route.path !== '/'"
            name="list"
            class="d-block d-lg-none"
            data-bs-toggle="offcanvas"
            data-bs-target="#docsSidebarLeftOffcanvas"
          />
        </div>
        <div class="col m-0 p-0">
          <ul
            class="d-flex justify-content-center align-items-center w-100 m-0 p-0"
            style="list-style: none"
          >
            <li class="mx-2 mx-sm-3">
              <NuxtLink to="/">Home</NuxtLink>
            </li>
            <li class="mx-2 mx-sm-3">
              <NuxtLink to="/docs/first-app">Docs</NuxtLink>
            </li>
            <!-- <li class="mx-2 mx-sm-3">
              <NuxtLink to="/packages">Packages</NuxtLink>
            </li> -->
          </ul>
        </div>
        <div class="col m-0 p-0"></div>
      </div>
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
