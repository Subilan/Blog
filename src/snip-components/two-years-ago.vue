<script setup lang="ts">
const twoYearsAgo = new Date(new Date().getTime() - 63072000000);
</script>

<template>
  <div style="display: inline-block">
    {{ twoYearsAgo.toLocaleString() }}
  </div>
</template>