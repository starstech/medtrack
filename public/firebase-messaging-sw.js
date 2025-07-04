/* eslint-disable no-undef */

// Import the Firebase scripts that are safe for service workers
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// TODO: Replace with your own config or generate dynamically at build time
firebase.initializeApp({
  apiKey: 'REPLACE_ME',
  authDomain: 'REPLACE_ME',
  projectId: 'REPLACE_ME',
  messagingSenderId: 'REPLACE_ME',
  appId: 'REPLACE_ME',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  // Customize notification here
  const { title, body, image } = payload.notification || {}
  const options = {
    body,
    icon: '/vite.svg',
    image,
    data: payload.data,
  }
  self.registration.showNotification(title || 'MedTrack', options)
}) 