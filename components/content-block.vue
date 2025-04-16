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
@use "@/assets/var";
@use "@/assets/ui";

details {
  padding: 16px;
  border-radius: var.$defaultBorderRadius;

  @include ui.Button;

  summary {
    color: var(--text);
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
    &, &:hover {
      background: var(--bg-dim);
    }

    summary span {
      font-size: 18px;
      font-weight: bold;
    }
  }
}
</style>