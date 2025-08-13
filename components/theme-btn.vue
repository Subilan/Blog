<template>
  <div class="icon-btn topright noprint" @click="themeModal = !themeModal">
    <icon :path="mdiPaletteOutline" />
  </div>

  <modal no-divider v-model="themeModal" title="设置主题">
    <template #title-end>
      <div class="icon-btn small noborder" @click="resetTheme">
        <icon :path="mdiRefresh" />
      </div>
    </template>
    <section>
      <p>字体 <small style="color: var(--dim)">*中文字体将自动适应。</small></p>
      <div class="grid">
        <div class="grid-item font-preview" @click="themeFont = font" :class="{ active: themeFont === font }"
          v-for="font in fonts">
          <img :src="`/font-preview/${font.replace(/\s/g, '-').toLowerCase()}.png`" />
        </div>
      </div>
    </section>
    <section>
      <p>颜色</p>
      <div class="grid">
        <div class="grid-item" @click="themeColor = color.value" :class="{ active: themeColor === color.value }"
          v-for="color in colors">
          {{ color.name }}
        </div>
      </div>
    </section>
    <section>
      <p>页面样式</p>
      <div class="grid">
        <div class="grid-item" @click="themeStyle = style.value"
          :class="`style-${style.value} ${themeStyle === style.value ? 'active' : ''}`" v-for="style in styles">
          {{ style.name }}
        </div>
      </div>
    </section>
  </modal>
</template>

<script lang="ts" setup>
  import { mdiPaletteOutline, mdiRefresh } from '@mdi/js';
  import type { AvailableFont } from '~/utils/types/fonts';
  import fonts from '~/utils/types/fonts';

  const themeModal = ref(false);
  const { themeFont, themeColor, themeStyle } = useTheme();

  const serifFonts: AvailableFont[] = ['Literata']

  function isSerif(font: AvailableFont) {
    return serifFonts.includes(font);
  }

  const styles = [
    {
      value: 'classic',
      name: '白纸黑字'
    },
    {
      value: 'typecho',
      name: 'Typecho'
    }
  ]

  const colors = [
    {
      value: 'auto',
      name: '跟随系统'
    },
    {
      value: 'day',
      name: '日间'
    },
    {
      value: 'night',
      name: '夜间'
    }
  ];

  function resetTheme() {
    themeColor.value = 'auto';
    themeFont.value = 'Literata';
    themeStyle.value = 'classic';
  }
</script>

<style lang="scss" scoped>
:root.color-night {
  .font-preview img {
    filter: invert(1);
  }
}

:root.color-auto {
  @media (prefers-color-scheme: dark) {
    .font-preview img {
      filter: invert(1);
    }
  }
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  .grid-item {
    border: 1px solid var(--dimdim);
    border-radius: 5px;
    padding: 8px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.font-preview {
      min-height: 1.5em;


      img {
        height: 14px;
      }
    }

    p,
    small {
      font-size: 12px;
      color: var(--dim);
    }

    &.active {
      border-color: var(--dim);
    }
  }
}

section {
  margin: 16px 0;

  &:first-child {
    margin-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }
}
</style>