<template>
  <svg-icon type="mdi" :path="props.path"/>
</template>

<script setup>
import SvgIcon from "@jamescoyle/vue-icon";

const props = defineProps({
  path: {
    type: String,
    required: true
  }
})

</script>