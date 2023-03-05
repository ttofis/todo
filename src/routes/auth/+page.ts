import type { PageLoad } from "./$types";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "$lib/firebase";
import { redirect } from "@sveltejs/kit";
import { browser } from "$app/environment";
import { error } from "@sveltejs/kit";

export const load = (( url ) => {
    console.log(url.url.toString());
    if (isSignInWithEmailLink(auth, url.url.toString()) && browser) {
        let email = window.localStorage.getItem('emailForSignIn');
        while (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        signInWithEmailLink(auth, email, url.url.toString())
        .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            throw redirect(300, '/');
        }).catch((err) => {
            throw error(500, err.message);
        });
    }
    return;
}) satisfies PageLoad;