<template>
    <div class="font-medium text-2xl mb-4">User Settings</div>

    <UCard v-if="currentUser?.group === 'Admin'" class="mb-4">
        <div class="flex flex-col gap-2">
            <div class="text-xl mb-1">Notifications</div>

            <div v-if="notificationPermissionGranted">
                <UAlert icon="i-heroicons-information-circle" color="green" variant="solid" title="Notifications are currently enabled." description="Notifications are currently enabled for this site. To disable them, please follow these steps: 1. Click the lock icon (or info icon) in the address bar 2. Find the 'Notifications' permission 3. Change it to 'Block' or 'Ask' (depending on your preference)." />
            </div>
            <div v-else class="flex flex-col gap-2">
                <UAlert icon="i-heroicons-information-circle" color="blue" variant="solid" title="Click below to receive notifications when a day order is created by a fitter." />
                <UButton class="w-fit" size="sm" color="blue" @click="requestPermission">Receive Notifications</UButton>
            </div>
        </div>
    </UCard>

    <UAlert v-if="isSavingToken" icon="i-heroicons-information-circle" color="yellow" variant="solid" title="Saving notification preferences..." description="Please do not refresh or leave this page." />
</template>

<script setup lang="ts">
import { getToken } from "firebase/messaging";

const messagingToken = ref('');
const { user: currentUser } = useUser();
const toast = useToast();

const isSavingToken = ref(false);

onMounted(async () => {
    if ("serviceWorker" in navigator) {
        try {
            console.log(navigator.serviceWorker);
        } catch (error) {
            alert('service worker registration failed: contact help or refresh the page');
            return;
        }
    }

    if (!("PushManager" in window)) {
        alert('Push notifications are not supported in this browser.');
        return;
    }
});

const notificationPermissionGranted = computed(() => window?.Notification?.permission === 'granted');

function getDeviceIdFromLocalStorage() {
    let deviceId;
    const defaultValue = { value: 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9) };

    // Try to get value from local storage
    deviceId = localStorage.getItem('deviceId');

    // Use the stored value if it exists, otherwise use the default
    if (deviceId) deviceId = JSON.parse(deviceId);
    
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

async function requestPermission() {
    if (!window.Notification) return;
    if (window.Notification.permission === 'granted') {
        await setToken();
    } else {
        window.Notification.requestPermission(async (value) => {
            if (value === 'granted') {
                await setToken();
            } else {
                toast.add({ title: 'Notifications are currently disabled. Change your browser settings to allow notifications and try again.', color: 'red' });
            }
        });
    }
}

async function setToken() {
    const { $messaging } = useNuxtApp();
    try {
        isSavingToken.value = true;
        const token = await getToken($messaging, {
            vapidKey: "BFVxvgDxvbJNonrThKbyRSNTzw2z33q41LtoPRQrg1bsB4Zg3hdo0PdNf0V_9PwDkK54TPIrAps6THN4rcSozFo"
        });

        messagingToken.value = token;
    } catch (error) {
        isSavingToken.value = false;
        alert('error getting token from firebase, contact for help or try again');
        return;
    }

    try {
        isSavingToken.value = true;
        // send token to server, save in user schema
        await $fetch('/api/users/token', {
            method: 'POST',
            body: { token: messagingToken.value, userId: currentUser.value?.id, deviceId: getDeviceIdFromLocalStorage()?.value }
        });
    } catch (error) {
        isSavingToken.value = false;
        alert('error creating token in database' + error);
        return;
    }

    isSavingToken.value = false;
}

function checkNotificationPermissionAndUpdateToken() {
    window.Notification.requestPermission(async (value) => {
        if (value !== 'granted') {
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
