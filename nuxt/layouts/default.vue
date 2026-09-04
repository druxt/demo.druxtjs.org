<template>
  <div class="min-h-screen bg-ink-bg text-ink-text antialiased">
    <Nuxt />
  </div>
</template>

<style>
/* The gradient sits on html so it covers the viewport regardless of content
   height, and does not repeat when the page is short. */
html {
  background: radial-gradient(120% 110% at 50% 0%, #1c2733 0%, #16202a 100%);
  background-attachment: fixed;
}
</style>
