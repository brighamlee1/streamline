<template>
    <VitePwaManifest />

    <div>
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>

        <UNotifications />
    </div>
</template>

<!--<script setup>-->
<!--const colorMode = useColorMode();-->

<!--// This function updates the status bar style based on the current theme-->
<!--const updateStatusBarStyle = () => {-->
<!--    const statusBarStyle = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');-->
<!--    if (statusBarStyle) {-->
<!--        const currentStatusBarStyleContent = statusBarStyle.content;-->
<!--        statusBarStyle.content = colorMode.value === 'dark' ? 'black-translucent' : 'default';-->
<!--        if (currentStatusBarStyleContent === statusBarStyle.content) reloadNuxtApp();-->
<!--    }-->
<!--}-->

<!--// Watch for changes in theme preference-->
<!--watchEffect(() => {-->
<!--    updateStatusBarStyle();-->
<!--});-->
<!--</script>-->