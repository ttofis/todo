<script lang="ts">
    import { validateEmail } from "$lib/validateEmail";
    import { triggerToast } from "$lib/triggerToast";
    import { GoogleAuthProvider, signInWithPopup, sendSignInLinkToEmail } from "firebase/auth";
    import { auth } from "$lib/firebase";
    
    const provider = new GoogleAuthProvider();

    let email: string;
    let disabled = false;

    const actionCodeSettings = {
        url: "https://todo.chrisch.dev",
        handleCodeInApp: true
    }

    function handleLogin() {
        if (validateEmail(email)) {
            disabled = true;
            sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email);
                triggerToast("Success! Check your email", 'variant-filled-secondary');
            })
            .catch((err) => {
                triggerToast("Something went wrong, please try again", 'variant-filled-warning');
                console.log(err);
            })
            disabled = false;
        }else{
            triggerToast("Incorrect credentials, please try again", 'variant-filled-error');
        }
    }

    /*async function login() {
        const auth = await pb.collection(Collections.Users).authWithPassword(email, password);
        if (browser) setTimeout(() => {}, 1000);
        return auth;
    }

    async function signup() {
        const data = {
            "email": email,
            "emailVisibility": true,
            "password": password,
            "passwordConfirm": password
        };
        await pb.collection(Collections.Users).create(data);
        await pb.collection(Collections.Users).requestVerification(email);
    }*/

    function handleLoginGoogle() {
        signInWithPopup(auth, provider)
        .catch((err) => {
            triggerToast("Something went wrong, please try again", 'variant-filled-warning');
            console.log(err);
        });
    }
</script>

<h2>Welcome to <span class="todo">Todo</span></h2>
<h2>the slick task app</h2>
<form class="mt-2 w-full flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="email" placeholder="email" autocomplete="email" bind:value={email} required />
    <button type="submit" disabled={disabled} class="btn variant-glass-secondary" on:click={handleLogin}>Login</button>
    <button type="button" disabled={disabled} class="btn variant-glass-primary" on:click={handleLoginGoogle}>Sign in with Google</button>
</form>

<style>
	.todo {
		font-family: "Allura", cursive;
        font-weight: normal;
        font-style: normal;
		font-size: 1.5em;
	}
</style>
