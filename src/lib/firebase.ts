import { browser } from "$app/environment";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";
import { writable } from "svelte/store";

const firebaseConfig = {
    apiKey: "AIzaSyDHED_PL14lY-uxhPzzX-Q6Yu5TkmaKXD0",
    authDomain: "todo-379621.firebaseapp.com",
    projectId: "todo-379621",
    storageBucket: "todo-379621.appspot.com",
    messagingSenderId: "580166982159",
    appId: "1:580166982159:web:8af8cbea4f64a7e17e617a"
};

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const currentUser = writable(auth.currentUser);

onAuthStateChanged(auth, (user) => {
    currentUser.set(user);
})

export const db = getFirestore(app);

if (browser) {
    enableIndexedDbPersistence(db)
    .catch((err) => {
        console.log("PWA not compatible")
        console.log(err);
    });
}

export function logout() {
    auth.signOut()
    .catch((err) => {
        console.log(err);
    })
}