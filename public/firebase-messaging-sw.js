importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

// Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyCYJ93_u5miXn3rdhvFQyVGm5CpfJYMZGY",
    authDomain: "efp-day-orders.firebaseapp.com",
    projectId: "efp-day-orders",
    storageBucket: "efp-day-orders.firebasestorage.app",
    messagingSenderId: "535661012789",
    appId: "1:535661012789:web:67535be85e4e766463ce7c",
    measurementId: "G-WG7JT6BTNK"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firebase Messaging service
const messaging = firebase.messaging();

/********* NOTIFICATIONS BLOCK *******************/
// messaging.onBackgroundMessage((payload) => {
//     console.log('[firebase-messaging-sw.js] Received background message ', payload);
//     self.registration.showNotification(payload.notification.title, { body: payload.notification.body, image: payload.notification.image });
// });
