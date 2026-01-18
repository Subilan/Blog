<template>
  <transition name="fade">
    <div class="modal-overlay" v-if="model" />
  </transition>

  <div class="modal-container" :style="{ pointerEvents: model ? 'all' : 'none' }" @click.self="model = false">
    <transition name="smoothzoom">
      <div class="modal" v-if="model">
        <div class="modal-title">
          <span>{{ title }}</span>
          <div class="spacer" />
          <div class="title-end">
            <slot name="title-end" />
            <div class="icon-btn small noborder" @click="model = false">
              <icon :path="mdiClose" />
            </div>
          </div>
        </div>
        <hr :style="{ borderWidth: noDivider ? '0' : '1px' }" />
        <div class="modal-content">
          <slot />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts" setup>
  import { mdiClose } from '@mdi/js';

  const model = defineModel<boolean>();
  const props = defineProps({
    title: {
      type: String
    },
    noDivider: {
      type: Boolean,
      default: false,
    }
  });

  function keyboardHandler(e: KeyboardEvent) {
    if (model.value) {
      if (e.key === 'Escape') {
        e.preventDefault();
        model.value = false;
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', keyboardHandler);
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', keyboardHandler);
  })
</script>