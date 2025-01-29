import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, onMessage, type Messaging } from 'firebase/messaging';

declare module '#app' {
    interface NuxtApp {
        $messaging: Messaging
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $messaging: Messaging
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    // Move useRuntimeConfig() inside the plugin function
    const config = useRuntimeConfig();

    // Initialize Firebase app
    const app = getApps()[0] ?? initializeApp(config.public.firebaseConfig);
    const messaging = getMessaging(app);

    // This runs whenever a message is received:
    onMessage(messaging, (payload) => {
        const toast = useToast(); // Ensure useToast is used within setup-compatible scope
        toast.add({ title: payload.notification?.title, description: payload.notification?.body, color: 'green' });
    });

    return {
        provide: {
            messaging,
        }
    };
});
