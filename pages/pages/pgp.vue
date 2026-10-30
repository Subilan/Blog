<template>
  <article class="prose-lg">
    <h1>PGP</h1>
    <ul>
      <li>Fingerprint — A97531E8053F38DD4E36F0482B6A1307C1596CC9</li>
      <li>Valid Until — 2028/01/01</li>
      <li>User ID — Subilan &lt;<a href="mailto:1843917482@qq.com">1843917482@qq.com</a>&gt;</li>
    </ul>
    <pre class="language-" style="white-space: pre-line">
      <code v-text="pgp"/>
    </pre>
  </article>
</template>

<script setup>
import pgp from '@/data/pgp.js'

definePageMeta({
  title: 'PGP'
})
</script>