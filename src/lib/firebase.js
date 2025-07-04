import { initializeApp } from 'firebase/app'
import { getMessaging, onMessage, getToken, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Guard against missing config (local dev without push)
let messaging = null
let app = null

if (firebaseConfig.apiKey) {
  app = initializeApp(firebaseConfig)
}

export const getFirebaseMessaging = async () => {
  if (!app) return null
  if (!messaging && (await isSupported())) {
    messaging = getMessaging(app)
  }
  return messaging
}

export { onMessage, getToken } 