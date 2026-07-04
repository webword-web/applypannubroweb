/**
 * Firebase Config and Initialization
 * 
 * Replace the placeholder values in the `firebaseConfig` object below with your actual
 * project credentials from the Firebase Console (Console -> Project Settings -> General -> Web Apps).
 */

const firebaseConfig = {
  apiKey: "AIzaSyCwwJPU3sJm0h-sOneIgCyDIKymMq5CMWA",
  authDomain: "apply-pannu-bro.firebaseapp.com",
  projectId: "apply-pannu-bro",
  storageBucket: "apply-pannu-bro.firebasestorage.app",
  messagingSenderId: "417505534076",
  appId: "1:417505534076:web:99eb725dd7afbf14e7e9f9",
  measurementId: "G-0FFB2BYKQQ"
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
