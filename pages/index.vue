<template>
    <div class="text-xl sm:text-2xl">
        Welcome back, <span class="font-bold">{{ currentUser?.name }}</span>
    </div>
    <div>
        You are a member of the
        <span class="font-bold">{{ currentUser?.group }}</span> group.
    </div>

    <div class="mt-5">
        <div class="max-w-[400px] rounded-md bg-gray-300 p-2 dark:bg-gray-900">
            <UVerticalNavigation :links="links">
                <template #default="{ link }">
                    <span class="link relative font-medium">{{ link.label }}</span>
                </template>
            </UVerticalNavigation>
        </div>
    </div>

    <UButton @click="test">Test</UButton>
</template>

<script setup>
import { getToken } from "firebase/messaging";

const messagingToken = ref('');
const { user: currentUser } = useUser();

const links = computed(() => [
    { label: 'New Day Order', icon: 'i-heroicons-briefcase', to: currentUser.value?.group === 'Admin' ? '/admin/day-orders/create' : '/day-orders/create' },
    { label: 'My Day Orders', icon: 'i-heroicons-users', to: '/user/day-orders' }
]);

const test = async () => {
    const response = await fetch(`/api/test`, { 
        method: 'POST',
        'Content-Type': 'application/json',
        body: JSON.stringify({
            userId: 1
        })
    });
};

// onMounted(() => {
//     requestPermission();
// });

function requestPermission() {
    if (!window.Notification) return;

    if (window.Notification.permission === 'granted') {
        setToken();
    } else {
        window.Notification.requestPermission((value) => {
            if (value === 'granted') {
                setToken();
            }
        })
    }
}

async function setToken() {
    const { $messaging } = useNuxtApp();
    const token = await getToken($messaging, {
        vapidKey: "BKS4L2cn18GpuALWuy5ZHMeG4Rnrr6HD2RPpdxbgmZJdZ_k__2tOPkFh6AkuC3p8n5f66neV4j7nWWPekNXxcwk"
    });

    messagingToken.value = token;
    // send token to server, save in user schema
    await $fetch('/api/users/token', {
        method: 'POST',
        body: { token, userId: currentUser.value?.id }
    });
}
</script>

<style scoped lang="postcss">
.link {
    @apply w-fit px-2 py-1 text-sm font-semibold transition-all;
}
</style>
