// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'EFP Day Orders',
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
        { name: 'apple-mobile-web-app-title', content: 'EFP Day Orders' }
      ],
      link: [
        { rel: 'apple-touch-icon', sizes: '152x152', href: '/favicon.ico' },
        { rel: "manifest", href: '/manifest.webmanifest' }
      ],
    }
  },
  css: ['./assets/global.css'],
  modules: ['@nuxt/ui', '@nuxtjs/color-mode', '@vite-pwa/nuxt'],
  postcss: { plugins: { tailwindcss: {}, autoprefixer: {} } },
  colorMode: { preference: 'dark', classSuffix: '' },
  ssr: false,
  pwa: {
    manifest: {
      name: 'EFP Day Orders',
      short_name: 'EFP',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      display_override: ['standalone', 'fullscreen', 'minimal-ui', 'browser'],
      background_color: '#000000',
      theme_color: '#ffffff'
      // more manifest settings
    }
  },
  runtimeConfig: {
    public: {
      firebaseConfig: {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
      }
    }
  }
});
