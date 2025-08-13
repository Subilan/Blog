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
          <div class="icon-btn small noborder" @click="model = false">
            <icon :path="mdiClose" />
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

<style lang="scss" scoped>
@use '@/assets/var';
@use '@/assets/ui';

.modal-overlay {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background: rgba($color: black, $alpha: .8);
  z-index: 1000;
  top: 0;
  left: 0;
}

.modal-container {
  position: fixed;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;

  .modal {
    width: 600px;
    background: var(--bg);
    padding: 24px;
    border-radius: 20px;
    color: var(--text);

    @include ui.simple-shadow;

    .modal-title {
      display: flex;
      align-items: center;

      >span {
        font-weight: bold;
        font-size: 24px;
      }
    }
  }
}
</style>