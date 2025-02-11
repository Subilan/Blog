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
           <icon :path="mdiWeatherSunny" v-if="!darkMode || forceMode === 'light'"/>
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

<style lang="scss">
.mobile-dark-toggle-btn-container {
  display: flex;
  justify-content: center;

  .mobile-dark-toggle-btn {
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    border-radius: 100%;
    width: 30px;
    height: 30px;
    position: absolute;
    bottom: 32px;
    cursor: pointer;
    transition: all .2s ease;

    &:hover {
      opacity: .7;
    }
  }
}

.dark .mobile-dark-toggle-btn {
  background: #212121;
}

.flowfromleft-enter-from,
.flowfromleft-leave-to {
  transform: translateX(-100px);
  opacity: 0;
}

.flowfromleft-enter-active,
.flowfromleft-leave-active {
  transition: all .2s ease;
}

.page-switcher {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 500;
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex-direction: column;
  box-sizing: border-box;
  background: rgba(0, 0, 0, .8);
  padding: 32px;
  gap: 32px;

  h2 {
    color: white;
    text-align: center;
    font-size: 32px;
  }
}

.page {
  text-decoration: none;
  background: white;
  border-radius: 10px;
  font-size: 28px;
  color: black;
  padding: 32px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  justify-content: center;

  svg {
    height: 32px;
    width: 32px;
    color: #009688;
  }

  &.router-link-exact-active {
    background: #009688;
    color: white;

    .inactive-icon {
      display: none;
    }

    svg {
      color: white;
    }
  }

  &:not(.router-link-exact-active) {
    .active-icon {
      display: none;
    }
  }
}
</style>