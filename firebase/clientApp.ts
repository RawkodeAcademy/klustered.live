import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBV6oO5ecQWIWb325nS20XbwXi_SSEsRUg",
  authDomain: "klustered.web.app",
  databaseURL:
    "https://rawkode-academy-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "rawkode-academy",
  storageBucket: "rawkode-academy.appspot.com",
  messagingSenderId: "578019966278",
  appId: "1:578019966278:web:67c36daf5da4f337fbf947",
  measurementId: "G-V35FERYVN5",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
