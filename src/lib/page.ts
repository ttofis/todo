import { writable } from "svelte/store";
import { currentUser } from "./pocketbase";

export const page = writable("login");
let loggedIn = false;

currentUser.subscribe((status) => {
    if (status) {
        loggedIn = true;
        if (status.name === '') {
            page.set("getName");
        }else{
            page.set("home");
        }
    }else{
        loggedIn = false;
        page.set("login");
    }
})

export function pageForgotPassword() {
    if (!loggedIn) {
        page.set("forgotPassword");
    }
}

export function pageHome() {
    if (!loggedIn) {
        page.set("login");
    }else{
        page.set("home");
    }
}