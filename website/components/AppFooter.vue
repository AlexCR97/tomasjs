<script setup lang="ts">
  function onGitHubIconClick() {
    window.open("https://github.com/AlexCR97/tomasjs", "_blank");
  }
</script>

<template>
  <footer class="border-top py-5 bg-light">
    <p class="text-center m-0">
      <Icon name="github" role="button" size="1.5rem" @click="onGitHubIconClick" />
    </p>
    <p class="text-center m-0">
      <small>&copy;TomasJS 2023</small>
    </p>
    <p class="text-center m-0">
      <small>Developed by <a href="https://github.com/AlexCR97" target="_blank">vi3x</a></small>
    </p>
  </footer>
</template>
