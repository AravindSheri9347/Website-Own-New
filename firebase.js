import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyB5RPmnslaA3mXVIPxapx7YMfLSp6wlA6A",
  authDomain: "chitchat-1a684.firebaseapp.com",
  projectId:  "chitchat-1a684",
  storageBucket: "chitchat-1a684.firebasestorage.app",
  // storageBucket: "chitchat-1a684.appspot.com",
  messagingSenderId:  "753237671940",
  appId: "1:753237671940:web:c1bfc1b2c21aee16dc3551",
};

export const app = initializeApp(firebaseConfig);
