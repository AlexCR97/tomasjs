<script setup lang="ts">
  withDefaults(
    defineProps<{
      title?: string;
      lang?: string;
      code?: string;
    }>(),
    {
      lang: "plaintext",
      code: "TODO",
    }
  );

  let com = ref();

  onMounted(async () => {
    const hljsVuePlugin = (await import("@highlightjs/vue-plugin")).default;
    console.log("hljsVuePlugin", hljsVuePlugin);
    com.value = hljsVuePlugin.component;
  });
</script>

<template>
  <div>
    <p v-if="title" class="m-0 p-0 fw-bold" style="font-size: 0.9rem">
      {{ title }}
    </p>
    <component :is="com" language="ts" :code="code" />
  </div>
</template>
