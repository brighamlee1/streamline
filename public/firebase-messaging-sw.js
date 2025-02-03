importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Firebase configuration object
const config = useRuntimeConfig();
const firebaseConfig = config.public.firebaseConfig;

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Messaging service
const messaging = firebase.messaging();

/********* NOTIFICATIONS BLOCK *******************/
// messaging.onBackgroundMessage((payload) => {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//     self.registration.showNotification(payload.notification.title, { body: payload.notification.body, image: payload.notification.image });
// });
