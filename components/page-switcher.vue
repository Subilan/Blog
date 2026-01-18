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
           <icon :path="mdiWeatherSunny" v-if="(!darkMode && forceMode !== 'dark') || forceMode === 'light'"/>
           <icon :path="mdiWeatherNight" v-if="(darkMode && forceMode !== 'light') || forceMode === 'dark'"/>
         </div>
       </div>
     </transition>
    </div>
  </transition>
</template>

<script setup>
import {pages} from '~/data/config.js'
import {mdiWeatherNight, mdiWeatherSunny} from "@mdi/js";
import {usePreferredDark} from "@vueuse/core";

const model = defineModel();

const darkMode = usePreferredDark();
const forceMode = useState('force-mode');
</script>