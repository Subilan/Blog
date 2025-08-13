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

<style lang="scss" scoped>
@use '@/assets/var';
@use '@/assets/ui';

@mixin ModalClassic {
  background: var(--bg);
  padding: 24px;
  color: var(--text);

  @include ui.SimpleShadow();
}

@mixin ModalTypecho {
  background: var(--bg-dim);
  padding: 20px;
  color: var(--text);

  .modal-title {
    color: #DB3B14;
  }
}

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
    border-radius: var(--border-radius);

    .modal-title {
      display: flex;
      align-items: center;

      .title-end {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      >span {
        font-weight: bold;
        font-size: 24px;
      }
    }
  }
}

:root.style-typecho .modal {
  @include ModalTypecho;
}

:root.style-classic .modal {
  @include ModalClassic;
}
</style>