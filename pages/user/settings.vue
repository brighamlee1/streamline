<template>
    <div class="font-medium text-2xl mb-4">User Settings</div>

    <UCard v-if="currentUser?.group === 'Admin'">
        <div class="flex flex-col gap-2">
            <div class="text-xl mb-1">Notifications</div>

            <div v-if="notificationPermissionGranted">
                <UAlert icon="i-heroicons-information-circle" color="green" variant="soft" title="Notifications are currently enabled." description="Notifications are currently enabled for this site. To disable them, please follow these steps: 1. Click the lock icon (or info icon) in the address bar 2. Find the 'Notifications' permission 3. Change it to 'Block' or 'Ask' (depending on your preference)." />
            </div>
            <div v-else class="flex flex-col gap-2">
                <UAlert icon="i-heroicons-information-circle" color="blue" variant="soft" title="Click below to receive notifications when a day order is created by a fitter." />
                <UButton class="w-fit" size="sm" color="blue" @click="requestPermission">Receive Notifications</UButton>
            </div>
        </div>
    </UCard>
</template>

<script setup lang="ts">
import { getToken } from "firebase/messaging";

const messagingToken = ref('');
const { user: currentUser } = useUser();
const toast = useToast();

const notificationPermissionGranted = computed(() => window?.Notification?.permission === 'granted');

function getDeviceIdFromLocalStorage() {
    let deviceId;
    const defaultValue = { value: 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) };

    // Try to get value from local storage
    deviceId = localStorage.getItem('deviceId');

    // Use the stored value if it exists, otherwise use the default
    if (deviceId) deviceId = JSON.parse(deviceId)
    
    // If the key doesn't exist in local storage, initialize it with the default value
    if (!deviceId) {
        localStorage.setItem('deviceId', JSON.stringify(defaultValue));
        deviceId = defaultValue;
    }

    return deviceId;
}

function removeDeviceIdFromLocalStorage() {
    localStorage.removeItem('deviceId');
}

function requestPermission() {
    if (!window.Notification) return;
    console.log('requesting permission');
    window.Notification.requestPermission(async (value) => {
        if (value === 'granted') {
            setToken();
        } else {
            toast.add({ title: 'Notifications are currently disabled. Change your browser settings to allow notifications and try again.', color: 'red' });
        }
    })
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
        body: { token, userId: currentUser.value?.id, deviceId: getDeviceIdFromLocalStorage()?.value }
    });
}

function checkNotificationPermissionAndUpdateToken() {
    console.log('checkNotificationPermissionAndUpdateToken');
    window.Notification.requestPermission(async (value) => {
        if (value !== 'granted') {
            console.log('permission denied');
            deleteTokenFromDatabase();
        }
    });
}

async function deleteTokenFromDatabase() {
    try {
        const response = await $fetch(`/api/users/token`, {
            method: 'DELETE',
            query: { userId: currentUser.value?.id, deviceId: getDeviceIdFromLocalStorage()?.value }
        });
        if (response) removeDeviceIdFromLocalStorage();
    } catch (error) {
        console.error(error);
    }
}

onMounted(() => {
    if (!localStorage.getItem('deviceId')) return;
    checkNotificationPermissionAndUpdateToken();
});
</script>
