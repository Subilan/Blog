<template>
  <back-btn v-if="$route.name !== 'index'"/>
  <main class="max-w-187.5 mx-auto my-10">
    <slot />
  </main>
  <default-footer />
  <back-to-top />
</template>