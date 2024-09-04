<template>
  <article>
    <h1>PGP</h1>
    <ul>
      <li>Fingerprint — BC66A8EAA950B9823A309871FC61A89A8F418BD5</li>
      <li>Valid Until — 2027/01/01</li>
      <li>User ID — Subilan &lt;<a href="mailto:christophersubilan@gmail.com">christophersubilan@gmail.com</a>&gt;</li>
    </ul>
    <pre class="language-" style="white-space: pre-line">
      <code v-text="pgp"/>
    </pre>
  </article>
</template>

<script setup>
import pgp from '~/data/pgp.js'
</script>