import { writable } from "svelte/store";
import { currentUser, db } from "$lib/firebase";
import { doc, getDoc } from "@firebase/firestore";
import type { User } from "firebase/auth";

export const page = writable("login");

currentUser.subscribe(async (status) => {
    updatePage(status);
})

export async function updatePage(status: User | null) {
    if (status) {
        const docRef = doc(db, "users", status.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            if (docSnap.get("name") === "") {
                page.set("getName");
            }else{
                page.set("home");
            }
        }else{
            page.set("getName");
        }
    }else{
        page.set("login");
    }
}