<script lang="ts">
    import { validateEmail, triggerToast } from "$lib/generalFunctions";
    import { GoogleAuthProvider, sendSignInLinkToEmail, signInWithCredential  } from "firebase/auth";
    import { auth } from "$lib/firebase";
    import { dev } from "$app/environment";
    import { onMount } from "svelte";
    
    let email = "";
    let disabled = true;

    const actionCodeSettings = {
        url: "https://todo.chrisch.dev",
        handleCodeInApp: true
    }

    /*function handleLogin() {
        if (validateEmail(email)) {
            disabled = true;
            sendSignInLinkToEmail(auth, email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email);
                triggerToast("Success! Check your email", 'variant-filled-secondary');
            })
            .catch((err) => {
                triggerToast("Something went wrong, please try again", 'variant-filled-warning');
                if (dev) console.log(err);
            })
            disabled = false;
        }else{
            triggerToast("Incorrect credentials, please try again", 'variant-filled-error');
        }
    }*/

    function handleCredentialResponse(response: { credential: any; }) {
        const idToken = response.credential;
        const credential = GoogleAuthProvider.credential(idToken);

        signInWithCredential(auth, credential).catch((err) => {
            triggerToast("Something went wrong, please try again", 'variant-filled-warning');
            if (dev) console.log(err);
        });
    }

	onMount(() => {
		//@ts-ignore
		window.handleCredentialResponse = handleCredentialResponse;
		//@ts-ignore
		google.accounts.id.initialize({
			client_id: "580166982159-894t8sf8g269ee5pru36kf77dv0d8s5r.apps.googleusercontent.com",
			context: "signin",
			ux_mode: "popup",
			callback: handleCredentialResponse,
		})
		//@ts-ignore
		google.accounts.id.renderButton(
			document.getElementById("buttonDiv"),
			{
				theme: "outline",
				type: "standard",
				shape: "pill",
				text: "signin_with",
				size: "large",
				logo_alignment: "left",
                width: 200
			}
		)
	})

    $: {
        if (validateEmail(email)) {
            disabled = false;
        }else{
            disabled = true;
        }
    }
</script>


<div class="text-center">
    <h2>Welcome to <span class="todo">Todo</span></h2>
    <h2>the slick task app</h2>
</div>
<div id="buttonDiv" class="mt-3 h-auto w-full flex justify-center"></div> 
<!--<form class="mt-2 w-full flex flex-col gap-3" on:submit|preventDefault>
    <input class="input" type="email" placeholder="email" autocomplete="email" bind:value={email} required />
    <button type="submit" disabled={disabled} class="btn variant-glass-secondary" on:click={handleLogin}>Continue</button>
</form>-->

<style>
	.todo {
		font-family: "Allura", cursive;
        font-weight: normal;
        font-style: normal;
		font-size: 1.5em;
	}
</style>
