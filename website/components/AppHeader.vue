<template>
  <header class="border-bottom px-4 py-3">
    <ul class="d-flex justify-content-center align-items-center m-0 p-0" style="list-style: none">
      <li class="mx-3">
        <NuxtLink to="/">Home</NuxtLink>
      </li>
      <li class="mx-3">
        <NuxtLink to="/docs/first-app">Docs</NuxtLink>
      </li>
      <li class="mx-3">
        <NuxtLink to="/packages">Packages</NuxtLink>
      </li>
    </ul>
  </header>
</template>

<style scoped>
  .router-link-exact-active {
    color: #12b488;
  }
</style>
