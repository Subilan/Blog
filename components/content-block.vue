<template>
  <details>
    <summary><icon :path="mdiArrowRight"/><span><slot name="title"/></span></summary>
    <slot/>
  </details>
</template>
<script setup lang="ts">
import {mdiArrowRight} from "@mdi/js";
</script>

<style lang="scss">
details {
  border: 1px solid rgba(0, 0, 0, .1);
  border-radius: 10px;
  padding: 16px;
  transition: all .2s ease;

  &:hover {
    border: 1px solid rgba(#004d40, .8);
    transform: translateY(-4px);
    box-shadow: 0 6px 0 rgba(0, 0, 0, .1);
  }

  summary {
    color: #004d40;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;

    svg {
      height: 18px;
      width: 18px;
      transition: all .2s ease;
      display: flex;
    }

    &::marker, &::-webkit-details-marker {
      content: none;
      display: none;
    }

    span {
      transition: all .2s ease;
    }
  }

  &[open] summary svg {
    transform: rotate(90deg);
  }

  &[open] {
    background: rgba(#e0f2f1, .4);

    summary span {
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>