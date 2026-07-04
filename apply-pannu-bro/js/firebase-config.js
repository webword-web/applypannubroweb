/**
 * Firebase Config and Initialization
 * 
 * Replace the placeholder values in the `firebaseConfig` object below with your actual
 * project credentials from the Firebase Console (Console -> Project Settings -> General -> Web Apps).
 */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  // Expose services globally for index/admin page scripts
  window.auth = firebase.auth();
  window.db = firebase.firestore();
  window.storage = firebase.storage();

  console.log("Firebase initialized successfully.");
} else {
  console.error("Firebase SDK is not loaded. Please ensure script tags are present in the HTML.");
}
