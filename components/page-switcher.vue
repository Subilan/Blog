<template>
  <transition name="opacity">
    <div class="page-switcher" v-if="model" @click="model = false">
      <transition name="flowfromleft" v-for="(x, i) in pages" appear>
        <router-link :style="{'transition-delay': 0.05 * i + 's'}" @click="model = false" class="page button" :to="x.to">
          <icon :path="x.icon" class="inactive-icon"/>
          <icon :path="x.iconActive" class="active-icon"/>
          {{ x.name }}
        </router-link>
      </transition>
     <transition name="opacity" appear>
       <div class="mobile-dark-toggle-btn-container">
         <div class="mobile-dark-toggle-btn button" @click="toggleDarkmode">
           <icon :path="modeIcon"/>
         </div>
       </div>
     </transition>
    </div>
  </transition>
</template>

<script setup>
import {pages} from '~/data/config.js'
import {mdiWeatherNight, mdiWeatherSunny, mdiThemeLightDark} from "@mdi/js";

const model = defineModel();

const forceMode = useState('force-mode');

const modeIcon = computed(() => {
  const mode = forceMode.value || 'auto';
  if (mode === 'auto') return mdiThemeLightDark;
  if (mode === 'dark') return mdiWeatherNight;
  return mdiWeatherSunny;
});
</script>
