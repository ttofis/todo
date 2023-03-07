<script lang="ts">
    import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import { browser } from "$app/environment";
    import type { PageData } from './$types';
    import { goto } from "$app/navigation";

    export let data: PageData;

    goto("/"); // For now

    if (isSignInWithEmailLink(auth, data.url) && browser) {
        let email = window.localStorage.getItem('emailForSignIn');
        while (!email) {
            email = window.prompt('Please provide your email for confirmation');
        }
        signInWithEmailLink(auth, email, data.url)
        .then(() => {
            window.localStorage.removeItem('emailForSignIn');
            goto("/");
        }).catch(() => {
            goto("/");
        });
    }
</script>

<h1>Trying to log you in</h1>