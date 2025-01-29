<template>
    <div>
        <div class="sticky top-0 z-40 flex w-full items-center px-4 py-2 shadow-md dark:shadow-sm sm:px-6 bg-gray-300 dark:bg-gray-900">
            <div class="hidden w-full items-center justify-between sm:flex">
                <img class="cursor-pointer" src="/favicon.ico" height="45" width="45" alt="Streamline" @click="navigateTo('/')" />
                
                <div class="flex items-center gap-4">
                    <template v-for="link in navigationLinks">
                        <NuxtLink
                            v-if="link.permission"
                            :class="[link.href === route.path && 'bg-white dark:bg-gray-500', 'h-fit rounded-md px-2 py-1 text-sm font-semibold transition-all hover:bg-gray-100 dark:hover:bg-gray-600']"
                            :to="link.href"
                            >{{ link.name }}</NuxtLink
                        >
                    </template>
                </div>

                <div class="flex items-center gap-3">
                    <SunIcon v-if="colorMode.preference === 'dark'" class="h-8 w-8 cursor-pointer text-gray-100 hover:text-gray-400" @click="updateColorMode('light')" />
                    <MoonIcon v-else class="h-8 w-8 cursor-pointer text-gray-950 hover:text-gray-700" @click="updateColorMode('dark')" />

                    <UDropdown :items="userItems" :popper="{ placement: 'bottom-start' }" v-if="currentUser">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 p-2 text-lg text-white">{{ currentUser?.firstName?.[0] }}{{ currentUser?.lastName?.[0] }}</div>
                    </UDropdown>
                </div>
            </div>

            <div class="flex w-full flex-row items-center justify-between sm:hidden">
                <div class="flex w-[60px] items-center">
                    <UIcon class="h-7 w-7" name="i-heroicons-bars-3" @click="isOpen = true" />
                </div>
                <USlideover class="!w-[70vw]" v-model="isOpen" side="left">
                    <div class="flex flex-row gap-3 p-5">
                        <div class="flex w-full flex-col gap-3">
                            <template v-for="link in navigationLinks">
                                <NuxtLink v-if="link.permission" @click="isOpen = false" class="rounded-md bg-gray-300 px-2 py-1 text-lg font-semibold transition-all hover:bg-gray-600 dark:bg-gray-700" :to="link.href">{{
                                    link.name
                                }}</NuxtLink>
                            </template>
                        </div>
                    </div>
                </USlideover>

                <img class="cursor-pointer" src="/favicon.ico" height="50" width="50" alt="Streamline" @click="navigateTo('/')" />

                <div class="flex items-center gap-3">
                    <SunIcon v-if="colorMode.preference === 'dark'" class="h-8 w-8 cursor-pointer text-gray-100 hover:text-gray-400" @click="updateColorMode('light')" />
                    <MoonIcon v-else class="h-8 w-8 cursor-pointer text-gray-950 hover:text-gray-700" @click="updateColorMode('dark')" />

                    <UDropdown :items="userItems" :popper="{ placement: 'bottom-start' }" v-if="currentUser">
                        <div class="flex h-8 w-8 items-center justify-center rounded-md bg-red-600 p-2 text-lg text-white">{{ currentUser?.firstName?.[0] }}{{ currentUser?.lastName?.[0] }}</div>
                    </UDropdown>
                </div>
            </div>
        </div>

        <main class="py-5">
            <div class="px-4 sm:px-6 lg:px-8">
                <slot />
            </div>
        </main>
    </div>
</template>

<script setup>
import { SunIcon, MoonIcon } from '@heroicons/vue/24/solid/index.js';

const { user: currentUser } = useUser();
const userCookie = useCookie("dayorders_user");
const colorMode = useColorMode();
const isOpen = ref(false);

const route = useRoute();

const navigationLinks = computed(() => [
    { name: 'Dashboard', href: '/', permission: true },
    { name: 'Admin Panel', href: '/admin', permission: currentUser.value?.group === 'Admin' }
]);

const userItems = computed(() => [
    [
        {
            class: currentUser.value?.group !== 'Admin' ? 'hidden' : '',
            label: 'Settings',
            click: () => navigateTo('/user/settings')
        },
        {
            label: 'Log Out',
            click: () => logout()
        }
    ]
]);

function logout() {
    currentUser.value = null;
    if (userCookie.value) userCookie.value = null;
    navigateTo('/login');
}

function updateColorMode(value) {
    colorMode.preference = value;
    localStorage.setItem('nuxt-color-mode', value);
}
</script>
