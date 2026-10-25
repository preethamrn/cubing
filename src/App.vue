<script setup>
import { RouterLink, RouterView } from 'vue-router'

const navigation = [
  { to: '/algtrainer', index: '01', label: 'Alg trainer' },
  { to: '/3bldtrainer', index: '02', label: '3BLD memo' },
  { to: '/median', index: '03', label: 'Median calculator' },
]
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <RouterLink class="brand" to="/algtrainer" aria-label="Cubing Lab home">
        <span class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 32 32" fill="none">
            <path d="m16 2.5 12 6.75v13.5L16 29.5 4 22.75V9.25L16 2.5Z" />
            <path d="m4.5 9.5 11.5 6.75L27.5 9.5M16 16.25v12.5M10 6l12 7" />
          </svg>
        </span>
        <span class="brand-wordmark">CUBING<span>LAB</span></span>
      </RouterLink>

      <nav class="main-nav" aria-label="Main navigation">
        <RouterLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          active-class="nav-link-active"
        >
          <span class="nav-index">{{ item.index }}</span>
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <a
        class="support-link"
        href="https://ko-fi.com/preetham"
        target="_blank"
        rel="noreferrer"
      >
        <span aria-hidden="true">♥</span>
        Support
      </a>
    </header>

    <main class="page-content">
      <RouterView />
    </main>

    <footer class="app-footer">
      <span>Made for the next solve.</span>
      <span class="footer-dot" aria-hidden="true">·</span>
      <span>Times are stored in this browser.</span>
    </footer>
  </div>
</template>
