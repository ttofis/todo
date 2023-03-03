<script lang="ts">
    import { pb } from "$lib/pocketbase";
    import type { Record, RecordAuthResponse } from "pocketbase";
    import { validateEmail } from "$lib/validateEmail";
    import { Collections } from "$lib/types/pocketbase-types";
    import { triggerToast } from "$lib/triggerToast";
    import { pageForgotPassword } from "$lib/page";

    let promise: Promise<RecordAuthResponse<Record> | void> | null;
    let email: string;
    let password: string;
    let disabled = false;

    function handleLogin() {
        if (validateEmail(email) && password.length >= 8) {
            disabled = true;
            promise = login();
            promise?.catch((error) => {
                if (error.status == 400) {
                    triggerToast("Email and password do not match, please try again", 'variant-filled-error');
                }else{
                    triggerToast("Something went wrong, please try again", 'variant-filled-warning');
                }
                disabled = false;
            })
        }else{
            triggerToast("Incorrect credentials, please try again", 'variant-filled-error');
        }
    }

    function handleSignup() {
        if (validateEmail(email) && password.length >= 8) {
            disabled = true;
            promise = signup();
            promise?.catch((error) => {
                if (error.status == 400) {
                    triggerToast("Email exists already, login instead", 'variant-filled-warning');
                }else{
                    triggerToast("Something went wrong, please try again", 'variant-filled-warning');
                }
                disabled = false;
            })
            promise?.then(() => {
                handleLogin();
            })
            promise?.then(() => {
                
            })
        }else{
            triggerToast("Incorrect credentials, please try again", 'variant-filled-error');
        }
    }

    async function login() {
        const auth = await pb.collection(Collections.Users).authWithPassword(email, password);
        /*if (browser) setTimeout(() => {}, 1000);*/
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
    }
</script>

<h2>Welcome to <span class="todo">Todo</span></h2>
<h2>the slick task app</h2>
<form class="mt-2 w-full flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="email" placeholder="email" autocomplete="email" bind:value={email} required />
    <input class="input" type="password" placeholder="password" minlength="8" bind:value={password} required />
    <button on:click|preventDefault={pageForgotPassword}>Forgot password</button>
    <div class="grid grid-cols-2 gap-2">
        <button disabled={disabled} class="btn variant-glass-secondary" on:click={handleLogin}>Login</button>
        <button disabled={disabled} class="btn variant-glass-secondary" on:click={handleSignup}>Sign up</button>
    </div>
</form>

<style>
	.todo {
		font-family: "Allura", cursive;
        font-weight: normal;
        font-style: normal;
		font-size: 1.5em;
	}
</style>
