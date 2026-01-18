<template>
  <details class="button">
    <summary>
      <icon :path="mdiArrowRight" /><span>
        <slot name="title" />
      </span>
    </summary>
    <slot />
  </details>
</template>
<script setup lang="ts">
  import { mdiArrowRight } from "@mdi/js";
</script>