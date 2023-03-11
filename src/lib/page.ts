import { derived } from "svelte/store";
import { currentUser, userData } from "$lib/firebase";

export const page = derived([currentUser, userData], ([$currentUser, $userData], set) => {
    if ($currentUser) {
        if ($userData.name === "") {
            set("getName");
        }else{
            set("home");
        }
    }else{
        set("login");
    }
}, "login");
